from config import initialize_terrax
from terrax import observe, shutdown

initialize_terrax()


@observe(
    name="login",
    capture_input=True,
    capture_output=True,
    redact=["password", "token", "api_key"],
)
def login(username: str, password: str, token: str):
    return {
        "username": username,
        "token": token,
        "message": "Login successful",
    }


result = login(
    username="yogesh",
    password="super-secret-password",
    token="secret-token-123",
)

print(result)

shutdown()