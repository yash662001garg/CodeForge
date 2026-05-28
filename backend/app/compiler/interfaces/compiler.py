from abc import ABC, abstractmethod

class ICompiler(ABC):

    @abstractmethod
    def get_image(self) -> str:
        pass

    @abstractmethod
    def get_compile_command(self, file_name: str) -> str:
        pass

    @abstractmethod
    def get_execute_command(self, file_name: str) -> str:
        pass
    
    @abstractmethod
    def get_file_extension(self) -> str:
        pass
