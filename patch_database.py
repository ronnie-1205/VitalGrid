import os

with open("backend/database.py", "r") as f:
    content = f.read()

import_stmt = "import os\n"
if "import os" not in content:
    content = import_stmt + content

old_url = 'SQLALCHEMY_DATABASE_URL = "sqlite:///./vitalgrid.db"'
new_url = 'db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vitalgrid.db")\nSQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"'

content = content.replace(old_url, new_url)

with open("backend/database.py", "w") as f:
    f.write(content)
