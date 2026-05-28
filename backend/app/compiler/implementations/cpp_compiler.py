from app.compiler.interfaces.compiler import ICompiler

class CppCompiler(ICompiler):

    def get_image(self) -> str:
        return "gcc:11"

    def get_compile_command(self, file_name: str) -> str:
        return f"g++ {file_name} -o main"

    def get_execute_command(self, file_name: str) -> str:
        return "./main"
        
    def get_file_extension(self) -> str:
        return ".cpp"
