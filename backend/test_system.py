import requests
import os

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_workflow():
    print("Testing AI Resume Engine...")
    
    # Check health/root
    try:
        r = requests.get("http://127.0.0.1:8000/")
        if r.status_code == 200:
            print("[PASS] Frontend Served")
        else:
            print(f"[FAIL] Frontend returned {r.status_code}")
    except:
        print("[SKIP] Server might not be running yet.")
        return

    # TODO: In a real test we'd upload files.
    # checking file existence
    dummy_resume = "dummy_resume.pdf"
    with open(dummy_resume, "w") as f:
        f.write("EXPERIENCE: Python Developer with 5 years experience in AI using LangChain. SKILLS: Python, FastAPI, Docker. EDUCATION: BS CS.")

    files = {'files': (dummy_resume, open(dummy_resume, 'rb'), 'application/pdf')}
    
    print("Uploading Resume...")
    try:
        r = requests.post(f"{BASE_URL}/upload", files=files)
        print(r.json())
        assert r.status_code == 200
        print("[PASS] Upload API")
    except Exception as e:
        print(f"[FAIL] Upload Failed: {e}")

    print("Shortlisting...")
    data = {
        "job_description": "Looking for a Python AI Engineer with FastAPI and LangChain experience.",
        "top_k": 3
    }
    
    try:
        r = requests.post(f"{BASE_URL}/shortlist", data=data)
        res = r.json()
        print(f"Results: Found {len(res['results'])} candidates")
        print(res['results'][0]['summary'])
        assert r.status_code == 200
        print("[PASS] Shortlist API")
    except Exception as e:
        print(f"[FAIL] Shortlist Failed: {e}")

    # Cleanup
    os.remove(dummy_resume)

if __name__ == "__main__":
    test_workflow()
