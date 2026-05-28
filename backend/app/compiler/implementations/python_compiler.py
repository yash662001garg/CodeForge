from app.compiler.interfaces.compiler import ICompiler

class PythonCompiler(ICompiler):

    def get_image(self) -> str:
        return "python:3.9-slim"

    def get_compile_command(self, file_name: str) -> str:
        return "" # No compilation needed

    def get_execute_command(self, file_name: str) -> str:
        return f"python {file_name}"
        
    def get_file_extension(self) -> str:
        return ".py"
