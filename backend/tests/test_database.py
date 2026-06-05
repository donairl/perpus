from app.database import _get_connect_args


def test_sqlite_url_returns_check_same_thread():
    args = _get_connect_args("sqlite:///./perpus.db")
    assert args == {"check_same_thread": False}


def test_sqlite_memory_url_returns_check_same_thread():
    args = _get_connect_args("sqlite:///:memory:")
    assert args == {"check_same_thread": False}


def test_postgresql_url_returns_empty_dict():
    args = _get_connect_args("postgresql://user:pass@localhost:5432/perpus")
    assert args == {}


def test_postgresql_plus_psycopg2_url_returns_empty_dict():
    args = _get_connect_args("postgresql+psycopg2://user:pass@localhost/perpus")
    assert args == {}
