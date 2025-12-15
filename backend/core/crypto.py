"""
Módulo de criptografia para senhas de conexões de banco.
Utiliza Fernet (AES) para criptografia simétrica.
"""
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings


def get_fernet():
    """Gera instância Fernet com chave derivada"""
    if not settings.ENCRYPTION_KEY:
        raise ValueError("ENCRYPTION_KEY não configurada no settings")

    key = settings.ENCRYPTION_KEY.encode()

    # Derivar chave de 32 bytes usando PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'forgereports_salt',  # Salt fixo (em produção, considere salt por empresa)
        iterations=100000,
    )
    derived_key = base64.urlsafe_b64encode(kdf.derive(key))
    return Fernet(derived_key)


def encrypt(text: str) -> str:
    """Criptografa texto e retorna string base64"""
    if not text:
        return ''

    f = get_fernet()
    return f.encrypt(text.encode()).decode()


def decrypt(encrypted_text: str) -> str:
    """Descriptografa texto de string base64"""
    if not encrypted_text:
        return ''

    f = get_fernet()
    return f.decrypt(encrypted_text.encode()).decode()
