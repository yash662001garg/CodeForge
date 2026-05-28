import docker
import io
import tarfile
from app.compiler.factory.compiler_factory import CompilerFactory

_docker_client = None

def get_docker_client():
    global _docker_client
    if _docker_client is None:
        _docker_client = docker.from_env(timeout=15)
    return _docker_client


def _make_tar(files: dict) -> bytes:
    """
    Create an in-memory tar archive from a dict of {filename: content_str}.
    """
    tar_stream = io.BytesIO()
    with tarfile.open(fileobj=tar_stream, mode="w") as tar:
        for name, content in files.items():
            data = content.encode("utf-8")
            info = tarfile.TarInfo(name=name)
            info.size = len(data)
            # Make scripts executable
            info.mode = 0o755 if name.endswith(".sh") else 0o644
            tar.addfile(info, io.BytesIO(data))
    tar_stream.seek(0)
    return tar_stream.read()


def execute_code_in_docker(language: str, code: str, user_input: str):
    try:
        compiler = CompilerFactory.get_compiler(language)
    except Exception as e:
        return {"error": str(e)}
        
    image = compiler.get_image()
    ext = compiler.get_file_extension()

    # For Java, class name should ideally match, assuming Main.java
    file_name = f"Main{ext}" if language == "java" else f"main{ext}"

    compile_cmd = compiler.get_compile_command(file_name)
    exec_cmd = compiler.get_execute_command(file_name)

    # Build a runner script to avoid shell quoting issues
    script_lines = ["#!/bin/sh", "set -e"]
    if compile_cmd:
        script_lines.append(compile_cmd)
    script_lines.append(f"{exec_cmd} < input.txt")
    run_script = "\n".join(script_lines) + "\n"

    # Prepare all files as an in-memory tar archive.
    # This avoids bind-mounting host paths, which breaks in Docker-in-Docker
    # scenarios (the Docker daemon runs on the host and can't see paths
    # inside the backend container).
    files = {
        file_name: code,
        "input.txt": user_input,
        "run.sh": run_script,
    }
    tar_data = _make_tar(files)

    container = None
    try:
        client = get_docker_client()

        # Create container without starting it
        container = client.containers.create(
            image,
            ["sh", "/app/run.sh"],
            working_dir="/app",
            mem_limit="128m",
            cpu_quota=50000,
            network_disabled=True,
        )

        # Copy files into the container via put_archive (no bind mounts needed)
        container.put_archive("/app", tar_data)

        # Start and wait for completion
        container.start()
        exit_status = container.wait()

        stdout = container.logs(stdout=True, stderr=False).decode("utf-8")
        stderr = container.logs(stdout=False, stderr=True).decode("utf-8")

        if exit_status.get("StatusCode", 0) != 0:
            return {"output": stderr or stdout}
        return {"output": stdout}

    except docker.errors.ContainerError as e:
        return {"output": e.stderr.decode("utf-8") if e.stderr else str(e)}
    except docker.errors.DockerException as e:
        return {"error": f"Docker error: {str(e)}"}
    except Exception as e:
        return {"output": str(e)}
    finally:
        # Clean up the container
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass
