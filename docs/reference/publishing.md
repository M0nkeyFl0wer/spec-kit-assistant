# Publishing to PyPI

## Prerequisites

- Python 3.9+
- `pip install build twine`
- PyPI account + API token stored in `~/.pypirc` or environment variables

## Release checklist

1. Bump the version in `pyproject.toml` (`[project] version = ...`).
2. Run the full test suite:
   ```bash
   pytest
   ```
3. Build the distributions:
   ```bash
   python -m build
   ```
   This creates `dist/here_spec-<version>.tar.gz` and `.whl` artifacts.
4. Upload to PyPI (or TestPyPI first):
   ```bash
   twine upload dist/*
   ```
5. Tag the release and push:
   ```bash
   git tag v<version>
   git push origin v<version>
   ```

## pipx / pip install

Once published, users can install via:

```bash
pipx install here-spec
# or
pip install here-spec
```

Future work: automate this process via GitHub Actions and explore building standalone binaries with tools such as `shiv` or `pyinstaller` for distribution alongside Little Helper.
