from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.database import SessionLocal, engine
from app.models import Base, Book, Category, Member, User, BookStatus, MembershipType, MemberStatus
from app.models import Transaction, TransactionType, Fine, FineType, FineStatus, Setting
from app.auth import get_password_hash
from datetime import datetime, timedelta

def seed_database(force=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not force and db.query(Book).count() > 0:
            print("Database already seeded. Use force=True or pass --force to reseed.")
            return

        # Clear existing data
        db.query(Fine).delete()
        db.query(Transaction).delete()
        db.query(Book).delete()
        db.query(Category).delete()
        db.query(Member).delete()
        db.query(User).delete()
        db.query(Setting).delete()
        db.commit()

        print("Seeding database...")

        # Settings
        db.add_all([
            Setting(key="late_fee_rate", value="1000", label="Denda per hari keterlambatan (Rp)"),
            Setting(key="max_borrow_days", value="14", label="Maksimal hari peminjaman"),
            Setting(key="max_borrow_books", value="3", label="Maksimal buku dipinjam sekaligus"),
        ])

        # Users
        db.add_all([
            User(username="admin", email="admin@perpus.id", hashed_password=get_password_hash("admin123")),
            User(username="petugas", email="petugas@perpus.id", hashed_password=get_password_hash("petugas123")),
        ])

        # Categories
        cats_data = [
            ("Fiksi", "Novel, cerpen, dan karya fiksi lainnya"),
            ("Sains & Teknologi", "Buku ilmu pengetahuan dan teknologi"),
            ("Sejarah", "Sejarah Indonesia dan dunia"),
            ("Pendidikan", "Buku pelajaran dan referensi akademik"),
            ("Bisnis & Ekonomi", "Manajemen, keuangan, kewirausahaan"),
            ("Kesehatan", "Medis, nutrisi, dan gaya hidup sehat"),
            ("Seni & Budaya", "Seni, musik, film, dan budaya"),
            ("Agama", "Buku keagamaan dan spiritualitas"),
        ]
        cat_objs = [Category(name=n, description=d) for n, d in cats_data]
        db.add_all(cat_objs)
        db.commit()
        cat_map = {c.name: c.id for c in db.query(Category).all()}

        # Books
        books_data = [
            ("Laskar Pelangi", "Andrea Hirata", "978-979-1234-01-1", "Fiksi", 3),
            ("Bumi Manusia", "Pramoedya Ananta Toer", "978-979-1234-02-2", "Fiksi", 2),
            ("Perahu Kertas", "Dee Lestari", "978-979-1234-03-3", "Fiksi", 2),
            ("5 Cm", "Donny Dhirgantoro", "978-979-1234-04-4", "Fiksi", 2),
            ("Ronggeng Dukuh Paruk", "Ahmad Tohari", "978-979-1234-05-5", "Fiksi", 1),
            ("Sapiens: Riwayat Singkat Umat Manusia", "Yuval Noah Harari", "978-979-1234-06-6", "Sains & Teknologi", 2),
            ("A Brief History of Time", "Stephen Hawking", "978-979-1234-07-7", "Sains & Teknologi", 1),
            ("Clean Code", "Robert C. Martin", "978-979-1234-08-8", "Sains & Teknologi", 3),
            ("The Pragmatic Programmer", "David Thomas", "978-979-1234-09-9", "Sains & Teknologi", 2),
            ("Indonesia Dalam Arus Sejarah", "Taufik Abdullah", "978-979-1234-10-0", "Sejarah", 2),
            ("Runtuhnya Kerajaan Hindu-Jawa", "Slamet Muljana", "978-979-1234-11-1", "Sejarah", 1),
            ("Matematika Dasar untuk Perguruan Tinggi", "B.K. Noormandiri", "978-979-1234-12-2", "Pendidikan", 4),
            ("Fisika Universitas", "Hugh D. Young", "978-979-1234-13-3", "Pendidikan", 3),
            ("Rich Dad Poor Dad", "Robert T. Kiyosaki", "978-979-1234-14-4", "Bisnis & Ekonomi", 2),
            ("Zero to One", "Peter Thiel", "978-979-1234-15-5", "Bisnis & Ekonomi", 1),
            ("The Lean Startup", "Eric Ries", "978-979-1234-16-6", "Bisnis & Ekonomi", 2),
            ("Why We Sleep", "Matthew Walker", "978-979-1234-17-7", "Kesehatan", 1),
            ("Atomic Habits", "James Clear", "978-979-1234-18-8", "Kesehatan", 3),
            ("Filosofi Teras", "Henry Manampiring", "978-979-1234-19-9", "Seni & Budaya", 2),
            ("Dalam Dekapan Ukhuwah", "Salim A. Fillah", "978-979-1234-20-6", "Agama", 2),
        ]
        book_objs = []
        for title, author, isbn, cat_name, copies in books_data:
            book_objs.append(Book(
                title=title, author=author, isbn=isbn,
                category_id=cat_map.get(cat_name),
                status=BookStatus.AVAILABLE, copies=copies,
            ))
        db.add_all(book_objs)
        db.commit()
        books = db.query(Book).all()

        # Members
        members_data = [
            ("Budi Santoso", "budi.santoso@email.com", "081234567801", MembershipType.BASIC, MemberStatus.ACTIVE),
            ("Siti Rahayu", "siti.rahayu@email.com", "081234567802", MembershipType.PREMIUM, MemberStatus.ACTIVE),
            ("Andi Wijaya", "andi.wijaya@email.com", "081234567803", MembershipType.BASIC, MemberStatus.ACTIVE),
            ("Dewi Kurniawati", "dewi.kurnia@email.com", "081234567804", MembershipType.VIP, MemberStatus.ACTIVE),
            ("Riko Pratama", "riko.pratama@email.com", "081234567805", MembershipType.BASIC, MemberStatus.ACTIVE),
            ("Fira Nuraini", "fira.nuraini@email.com", "081234567806", MembershipType.PREMIUM, MemberStatus.ACTIVE),
            ("Yoga Setiawan", "yoga.setiawan@email.com", "081234567807", MembershipType.BASIC, MemberStatus.ACTIVE),
            ("Maya Indah", "maya.indah@email.com", "081234567808", MembershipType.BASIC, MemberStatus.ACTIVE),
            ("Hendra Kusuma", "hendra.kusuma@email.com", "081234567809", MembershipType.BASIC, MemberStatus.INACTIVE),
            ("Laila Fitri", "laila.fitri@email.com", "081234567810", MembershipType.PREMIUM, MemberStatus.ACTIVE),
        ]
        member_objs = [Member(name=n, email=e, phone=p, membership_type=mt, status=ms, books_count=0)
                       for n, e, p, mt, ms in members_data]
        db.add_all(member_objs)
        db.commit()
        members = db.query(Member).all()

        now = datetime.utcnow()

        def add_borrow(book, member, days_ago, due_days=14):
            t = Transaction(
                book_id=book.id, member_id=member.id,
                transaction_type=TransactionType.BORROW,
                transaction_date=now - timedelta(days=days_ago),
                due_date=now - timedelta(days=days_ago) + timedelta(days=due_days),
            )
            db.add(t); db.flush()
            return t

        def add_return(book, member, days_ago, borrow_tx):
            t = Transaction(
                book_id=book.id, member_id=member.id,
                transaction_type=TransactionType.RETURN,
                transaction_date=now - timedelta(days=days_ago),
                due_date=borrow_tx.due_date,
                return_date=now - timedelta(days=days_ago),
            )
            db.add(t); db.flush()
            return t

        # Budi: borrow Laskar Pelangi 20 days ago, returned 5 days ago (1 day late), fine paid
        b1 = add_borrow(books[0], members[0], days_ago=20, due_days=14)
        add_return(books[0], members[0], days_ago=5, borrow_tx=b1)
        db.add(Fine(member_id=members[0].id, book_id=books[0].id, transaction_id=b1.id,
                    fine_type=FineType.LATE, amount=1000, status=FineStatus.PAID,
                    reason="Terlambat 1 hari", paid_at=now - timedelta(days=4)))

        # Siti: currently borrowing Bumi Manusia (10 days, not yet due)
        add_borrow(books[1], members[1], days_ago=10, due_days=14)
        books[1].status = BookStatus.BORROWED

        # Andi: borrow Clean Code 30 days ago, overdue, unpaid fine
        b3 = add_borrow(books[7], members[2], days_ago=30, due_days=14)
        books[7].status = BookStatus.BORROWED
        db.add(Fine(member_id=members[2].id, book_id=books[7].id, transaction_id=b3.id,
                    fine_type=FineType.LATE, amount=16000, status=FineStatus.UNPAID,
                    reason="Terlambat 16 hari"))

        # Dewi: borrow Atomic Habits, returned on time
        b4 = add_borrow(books[17], members[3], days_ago=15, due_days=14)
        add_return(books[17], members[3], days_ago=1, borrow_tx=b4)

        # Riko: lost Rich Dad Poor Dad, unpaid fine
        b5 = add_borrow(books[13], members[4], days_ago=25, due_days=14)
        books[13].status = BookStatus.BORROWED
        db.add(Fine(member_id=members[4].id, book_id=books[13].id, transaction_id=b5.id,
                    fine_type=FineType.LOST, amount=150000, status=FineStatus.UNPAID,
                    reason="Buku dilaporkan hilang"))

        # Fira: currently borrowing Filosofi Teras (3 days ago)
        add_borrow(books[18], members[5], days_ago=3, due_days=14)
        books[18].status = BookStatus.BORROWED

        # Yoga: returned Perahu Kertas on time
        b7 = add_borrow(books[2], members[6], days_ago=18, due_days=14)
        add_return(books[2], members[6], days_ago=4, borrow_tx=b7)

        db.commit()

        print(f"Seeded: {len(cats_data)} categories, {len(books_data)} books, {len(members_data)} members")
        print("Transactions and fines seeded with realistic scenarios.")
        print("Login: admin / admin123  |  petugas / petugas123")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import sys as _sys
    seed_database(force="--force" in _sys.argv)
