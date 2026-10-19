import os
import tempfile

os.environ["BOOKIT_DB"] = os.path.join(tempfile.mkdtemp(), "bookit-test.db")
