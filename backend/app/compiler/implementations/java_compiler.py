from app.compiler.interfaces.compiler import ICompiler

class JavaCompiler(ICompiler):

    def get_image(self) -> str:
        return "openjdk:17-jdk-slim"

    def get_compile_command(self, file_name: str) -> str:
        return f"javac {file_name}"

    def get_execute_command(self, file_name: str) -> str:
        # Assuming class name is same as file name without extension
        class_name = file_name.replace(".java", "")
        return f"java {class_name}"
        
    def get_file_extension(self) -> str:
        return ".java"
