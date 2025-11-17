from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.database import SessionLocal, engine
from app.models import Base, Book, Member, User, BookStatus, MembershipType, MemberStatus, Transaction, TransactionType
from app.auth import get_password_hash
from datetime import datetime, timedelta
import random

def seed_database():
    """Seed the database with sample data for development and testing."""

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(Book).count() > 0:
            print("Database already seeded!")
            return

        print("Seeding database with sample data...")

        # Create admin user
        admin = User(
            username="admin",
            email="admin@perpus.com",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin)

        # Create librarian user
        librarian = User(
            username="librarian",
            email="librarian@perpus.com",
            hashed_password=get_password_hash("lib123")
        )
        db.add(librarian)

        # Create comprehensive sample books
        books_data = [
            # Fiction
            {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "isbn": "9780743273565", "category": "Fiction", "copies": 3},
            {"title": "1984", "author": "George Orwell", "isbn": "9780451524935", "category": "Fiction", "copies": 2},
            {"title": "To Kill a Mockingbird", "author": "Harper Lee", "isbn": "9780061120084", "category": "Fiction", "copies": 4},
            {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "isbn": "9780316769488", "category": "Fiction", "copies": 1},
            {"title": "One Hundred Years of Solitude", "author": "Gabriel García Márquez", "isbn": "9780060883287", "category": "Fiction", "copies": 2},
            {"title": "The Brothers Karamazov", "author": "Fyodor Dostoevsky", "isbn": "9780374528379", "category": "Fiction", "copies": 1},

            # Fantasy
            {"title": "Harry Potter and the Philosopher's Stone", "author": "J.K. Rowling", "isbn": "9780439708180", "category": "Fantasy", "copies": 5},
            {"title": "The Hobbit", "author": "J.R.R. Tolkien", "isbn": "9780547928227", "category": "Fantasy", "copies": 3},
            {"title": "The Name of the Wind", "author": "Patrick Rothfuss", "isbn": "9780756404079", "category": "Fantasy", "copies": 2},
            {"title": "A Court of Thorns and Roses", "author": "Sarah J. Maas", "isbn": "9781619634442", "category": "Fantasy", "copies": 3},

            # Romance
            {"title": "Pride and Prejudice", "author": "Jane Austen", "isbn": "9780141439518", "category": "Romance", "copies": 2},
            {"title": "The Notebook", "author": "Nicholas Sparks", "isbn": "9780446605236", "category": "Romance", "copies": 4},
            {"title": "Outlander", "author": "Diana Gabaldon", "isbn": "9780440212560", "category": "Romance", "copies": 2},

            # Science Fiction
            {"title": "Dune", "author": "Frank Herbert", "isbn": "9780441013593", "category": "Science Fiction", "copies": 3},
            {"title": "Neuromancer", "author": "William Gibson", "isbn": "9780441569595", "category": "Science Fiction", "copies": 2},
            {"title": "The Three-Body Problem", "author": "Cixin Liu", "isbn": "9780765382030", "category": "Science Fiction", "copies": 1},

            # Non-Fiction
            {"title": "Sapiens", "author": "Yuval Noah Harari", "isbn": "9780062316097", "category": "Non-Fiction", "copies": 2},
            {"title": "Educated", "author": "Tara Westover", "isbn": "9780399590504", "category": "Non-Fiction", "copies": 3},
            {"title": "Atomic Habits", "author": "James Clear", "isbn": "9780735211292", "category": "Non-Fiction", "copies": 4},
            {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "isbn": "9780374533557", "category": "Non-Fiction", "copies": 2},

            # Mystery/Thriller
            {"title": "The Girl with the Dragon Tattoo", "author": "Stieg Larsson", "isbn": "9780307949486", "category": "Mystery", "copies": 3},
            {"title": "Gone Girl", "author": "Gillian Flynn", "isbn": "9780307588371", "category": "Thriller", "copies": 4},
            {"title": "The Silent Patient", "author": "Alex Michaelides", "isbn": "9781250301697", "category": "Thriller", "copies": 2},
        ]

        # Create books first
        books = []
        borrowed_indices = []  # Track which books are borrowed for transactions

        for i, book_data in enumerate(books_data):
            # Randomly assign some books as borrowed or reserved
            status = BookStatus.AVAILABLE
            if random.random() < 0.15:  # 15% chance
                status = BookStatus.BORROWED
                borrowed_indices.append(i)
            elif random.random() < 0.05:  # 5% chance for reserved
                status = BookStatus.RESERVED

            book = Book(
                title=book_data["title"],
                author=book_data["author"],
                isbn=book_data["isbn"],
                category=book_data["category"],
                status=status,
                copies=book_data["copies"]
            )
            books.append(book)
            db.add(book)

        # Create members
        members_data = [
            {"name": "John Doe", "email": "john@example.com", "phone": "(555) 123-4567", "type": MembershipType.PREMIUM, "join_days": 350, "books": 3},
            {"name": "Jane Smith", "email": "jane@example.com", "phone": "(555) 234-5678", "type": MembershipType.VIP, "join_days": 315, "books": 5},
            {"name": "Bob Johnson", "email": "bob@example.com", "phone": "(555) 345-6789", "type": MembershipType.BASIC, "join_days": 266, "books": 1},
            {"name": "Alice Williams", "email": "alice@example.com", "phone": "(555) 456-7890", "type": MembershipType.PREMIUM, "join_days": 240, "books": 2},
            {"name": "Charlie Brown", "email": "charlie@example.com", "phone": "(555) 567-8901", "type": MembershipType.BASIC, "join_days": 395, "books": 0},
            {"name": "Diana Prince", "email": "diana@example.com", "phone": "(555) 678-9012", "type": MembershipType.VIP, "join_days": 213, "books": 4},
            {"name": "Michael Chen", "email": "michael@example.com", "phone": "(555) 789-0123", "type": MembershipType.PREMIUM, "join_days": 180, "books": 2},
            {"name": "Sarah Wilson", "email": "sarah@example.com", "phone": "(555) 890-1234", "type": MembershipType.BASIC, "join_days": 95, "books": 1},
            {"name": "David Rodriguez", "email": "david@example.com", "phone": "(555) 901-2345", "type": MembershipType.VIP, "join_days": 150, "books": 6},
            {"name": "Emma Thompson", "email": "emma@example.com", "phone": "(555) 012-3456", "type": MembershipType.PREMIUM, "join_days": 75, "books": 3},
            {"name": "Alex Johnson", "email": "alex@example.com", "phone": "(555) 111-2222", "type": MembershipType.BASIC, "join_days": 30, "books": 0},
            {"name": "Maria Garcia", "email": "maria@example.com", "phone": "(555) 222-3333", "type": MembershipType.PREMIUM, "join_days": 200, "books": 4},
        ]

        members = []
        for member_data in members_data:
            # Randomly make some members inactive or expired
            status = MemberStatus.ACTIVE
            if random.random() < 0.1:  # 10% chance
                status = MemberStatus.INACTIVE
            elif random.random() < 0.05 and member_data["join_days"] > 365:  # 5% chance for old members
                status = MemberStatus.EXPIRED

            member = Member(
                name=member_data["name"],
                email=member_data["email"],
                phone=member_data["phone"],
                membership_type=member_data["type"],
                status=status,
                books_count=member_data["books"],
                join_date=datetime.now() - timedelta(days=member_data["join_days"])
            )
            members.append(member)
            db.add(member)

        # Commit books and members first to get IDs
        db.commit()

        # Create transactions for borrowed books
        transactions = []

        for i, book_index in enumerate(borrowed_indices):
            if i < len(members):
                book = books[book_index]
                member = members[i % len(members)]

                # Create borrow transaction
                borrow_transaction = Transaction(
                    book_id=book.id,
                    member_id=member.id,
                    transaction_type=TransactionType.BORROW,
                    transaction_date=datetime.now() - timedelta(days=random.randint(1, 30)),
                    due_date=datetime.now() + timedelta(days=random.randint(1, 14))
                )
                transactions.append(borrow_transaction)
                db.add(borrow_transaction)

                # 30% chance of having a return transaction
                if random.random() < 0.3:
                    return_transaction = Transaction(
                        book_id=book.id,
                        member_id=member.id,
                        transaction_type=TransactionType.RETURN,
                        transaction_date=datetime.now() - timedelta(days=random.randint(0, 7)),
                        return_date=datetime.now() - timedelta(days=random.randint(0, 7))
                    )
                    transactions.append(return_transaction)
                    db.add(return_transaction)

        db.commit()
        print("✅ Database seeded successfully!")
        print(f"📚 Created {len(books)} books across {len(set(b['category'] for b in books_data))} categories")
        print(f"👥 Created {len(members)} members with various membership types")
        print(f"🔄 Created {len(transactions)} transactions")
        print("\n🔐 Admin credentials:")
        print("   Username: 'admin', Password: 'admin123'")
        print("   Username: 'librarian', Password: 'lib123'")
        print("\n📖 Sample data includes borrowed and reserved books for testing")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()