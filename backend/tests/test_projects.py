def test_project_crud(client):
    # 1. Create project
    create_res = client.post("/api/projects", json={
        "name": "Cloud Native Banking Engine",
        "description": "High frequency ledger with event sourcing",
        "domain": "FinTech / Banking",
        "config": {"teamSize": 8}
    })
    assert create_res.status_code == 201
    project_data = create_res.json()
    project_id = project_data["id"]
    assert project_data["name"] == "Cloud Native Banking Engine"

    # 2. List projects
    list_res = client.get("/api/projects")
    assert list_res.status_code == 200
    ids = [p["id"] for p in list_res.json()]
    assert project_id in ids

    # 3. Get project by ID
    get_res = client.get(f"/api/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["domain"] == "FinTech / Banking"

    # 4. Update project
    put_res = client.put(f"/api/projects/{project_id}", json={
        "status": "In_Progress",
        "domain": "FinTech / Payments"
    })
    assert put_res.status_code == 200
    assert put_res.json()["status"] == "In_Progress"
    assert put_res.json()["domain"] == "FinTech / Payments"

    # 5. Delete project
    del_res = client.delete(f"/api/projects/{project_id}")
    assert del_res.status_code == 204
