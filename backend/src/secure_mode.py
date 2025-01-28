from fastapi import APIRouter, Depends, status

from config import get_secure_mode

router = APIRouter()

@router.get("/secure-mode", status_code=status.HTTP_200_OK)
async def get_secure_mode_status():
    return {"secure_mode": get_secure_mode()}