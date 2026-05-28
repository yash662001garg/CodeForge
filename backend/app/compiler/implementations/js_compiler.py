from app.compiler.interfaces.compiler import ICompiler

class JavaScriptCompiler(ICompiler):

    def get_image(self) -> str:
        return "node:18-slim"

    def get_compile_command(self, file_name: str) -> str:
        return ""

    def get_execute_command(self, file_name: str) -> str:
        return f"node {file_name}"
        
    def get_file_extension(self) -> str:
        return ".js"
