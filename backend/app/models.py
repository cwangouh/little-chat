from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Table
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow():
    return datetime.now(timezone.utc)


class ConversationType(str, Enum):
    CHAT = "chat"
    GROUP = "group"


class Base(AsyncAttrs, DeclarativeBase):
    pass


contacts_association = Table(
    "contacts_association",
    Base.metadata,
    Column("user_id", ForeignKey("users.user_id"), primary_key=True),
    Column("contact_id", ForeignKey("users.user_id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    first_name: Mapped[str] = mapped_column(nullable=False)
    surname: Mapped[str] = mapped_column(nullable=False)
    tag: Mapped[str] = mapped_column(nullable=False, unique=True)
    password_hashed: Mapped[str] = mapped_column(nullable=False)
    bio: Mapped[str] = mapped_column(nullable=True)

    contacts: Mapped[List["User"]] = relationship(
        "User",
        secondary=contacts_association,
        primaryjoin=user_id == contacts_association.c.user_id,
        secondaryjoin=user_id == contacts_association.c.contact_id,
        backref="contact_of",
        lazy="noload",
    )

    session: Mapped["Session"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="noload",
    )


class Session(Base):
    __tablename__ = "sessions"

    session_id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )

    refresh_token: Mapped[str] = mapped_column(
        String(255), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"), nullable=False
    )

    user: Mapped["User"] = relationship(
        back_populates="session", lazy="noload")


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True)

    type: Mapped[ConversationType] = mapped_column(
        SQLEnum(ConversationType), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    title: Mapped[Optional[str]] = mapped_column(String(255))

    messages: Mapped[list["Message"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="noload",
    )


class Chat(Base):
    __tablename__ = "chats"

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.conversation_id"),
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    user_id2: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    conversation: Mapped["Conversation"] = relationship(lazy="noload")


class Message(Base):
    __tablename__ = "messages"

    message_id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )

    text: Mapped[str] = mapped_column(
        String(2047), nullable=False
    )

    is_edited: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.conversation_id"),
        nullable=False
    )

    user: Mapped["User"] = relationship(lazy="noload")
    conversation: Mapped["Conversation"] = relationship(
        back_populates="messages",
        lazy="noload"
    )

    reactions: Mapped[list["Reaction"]] = relationship(
        back_populates="message",
        cascade="all, delete-orphan",
        lazy="noload",
    )


class Reaction(Base):
    __tablename__ = "reactions"

    reaction_id: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )

    reaction_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )

    message_id: Mapped[int] = mapped_column(
        ForeignKey("messages.message_id"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False
    )

    message: Mapped["Message"] = relationship(
        back_populates="reactions",
        lazy="noload"
    )
    user: Mapped["User"] = relationship(lazy="noload")
