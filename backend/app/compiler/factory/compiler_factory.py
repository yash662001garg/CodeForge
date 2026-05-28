from app.compiler.implementations.python_compiler import PythonCompiler
from app.compiler.implementations.java_compiler import JavaCompiler
from app.compiler.implementations.cpp_compiler import CppCompiler
from app.compiler.implementations.js_compiler import JavaScriptCompiler

class CompilerFactory:

    compilers = {
        "python": PythonCompiler,
        "java": JavaCompiler,
        "cpp": CppCompiler,
        "javascript": JavaScriptCompiler
    }

    @staticmethod
    def get_compiler(language: str):
        compiler = CompilerFactory.compilers.get(language)

        if not compiler:
            raise Exception(f"Unsupported language: {language}")

        return compiler()
