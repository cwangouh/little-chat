from typing import List

from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(AsyncAttrs, DeclarativeBase):
    pass


friends_association = Table(
    "friends_association",
    Base.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("friend_id", ForeignKey("users.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    first_name: Mapped[str] = mapped_column(nullable=False)
    surname: Mapped[str] = mapped_column(nullable=False)
    tag: Mapped[str] = mapped_column(nullable=False, unique=True)
    password_hashed: Mapped[str] = mapped_column(nullable=False)

    friends: Mapped[List["User"]] = relationship(
        "User",
        secondary=friends_association,
        primaryjoin=id == friends_association.c.user_id,
        secondaryjoin=id == friends_association.c.friend_id,
        backref="friend_of",
        lazy="noload",
    )

    refresh_token: Mapped["RefreshToken"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="noload",
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    token: Mapped[str] = mapped_column(nullable=False)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    user: Mapped["User"] = relationship(back_populates="refresh_token", lazy="noload")
