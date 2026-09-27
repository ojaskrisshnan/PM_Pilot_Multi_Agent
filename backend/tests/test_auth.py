def test_register_and_login(client):
    # Register
    res = client.post("/api/auth/register", json={
        "name": "Alice Engineer",
        "email": "alice@example.com",
        "password": "securepassword123"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alice@example.com"
    token = data["access_token"]

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "alice@example.com",
        "password": "securepassword123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Get Current User (/api/auth/me)
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Alice Engineer"

def test_login_invalid_password(client):
    res = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrong"
    })
    assert res.status_code == 401

def test_user_authorization_isolation(client):
    # Register User A
    res_a = client.post("/api/auth/register", json={
        "name": "User Alpha",
        "email": "alpha@example.com",
        "password": "passwordA123"
    })
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]

    # Register User B
    res_b = client.post("/api/auth/register", json={
        "name": "User Beta",
        "email": "beta@example.com",
        "password": "passwordB123"
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]

    # User A creates a private project
    proj_res = client.post(
        "/api/projects",
        json={"name": "Alpha Confidential Project", "domain": "FinTech"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert proj_res.status_code == 201
    project_a_id = proj_res.json()["id"]

    # User A can access Project A
    get_res_a = client.get(f"/api/projects/{project_a_id}", headers={"Authorization": f"Bearer {token_a}"})
    assert get_res_a.status_code == 200

    # User B MUST NOT access Project A (HTTP 403 Forbidden)
    get_res_b = client.get(f"/api/projects/{project_a_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert get_res_b.status_code == 403

    # Unauthenticated visitor MUST NOT access Project A (HTTP 401 Unauthorized)
    get_res_anon = client.get(f"/api/projects/{project_a_id}")
    assert get_res_anon.status_code == 401
