from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CodeHistory, User
from app.compiler.executor import execute_code_in_docker

router = APIRouter()

class ExecuteRequest(BaseModel):
    language: str
    code: str
    input: str = ""
    user_id: int

@router.post("/execute")
def execute(req: ExecuteRequest, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = execute_code_in_docker(req.language, req.code, req.input)
    
    # Save history
    new_history = CodeHistory(
        user_id=user.id,
        language=req.language,
        code=req.code
    )
    db.add(new_history)
    db.commit()
    
    return {
        "status": "success" if "error" not in result else "error",
        "language": req.language,
        "output": result.get("output", result.get("error"))
    }

@router.get("/history/{user_id}")
def history(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    histories = db.query(CodeHistory).filter(CodeHistory.user_id == user.id).order_by(CodeHistory.created_at.desc()).limit(5).all()
    
    return {
        "user_id": user.id,
        "last_5_codes": [{"language": h.language, "code": h.code, "created_at": h.created_at} for h in histories]
    }
