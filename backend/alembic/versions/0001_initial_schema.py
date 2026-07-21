"""initial schema — vehicle_registry_specs, user_profiles, consumer_fault_reports, vehicle_submission_queue

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-01-01 00:00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from geoalchemy2 import Geometry
from sqlalchemy.dialects.postgresql import UUID

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "vehicle_registry_specs",
        sa.Column("spec_id", sa.Integer(), primary_key=True),
        sa.Column("make", sa.String(50), nullable=False),
        sa.Column("model", sa.String(50), nullable=False),
        sa.Column("mfg_year", sa.Integer(), nullable=False),
        sa.Column("emission_standard", sa.String(15), nullable=False),
        sa.Column("fuel_delivery_system", sa.String(20), nullable=False),
        sa.Column("fuel_tank_material", sa.String(15), nullable=False),
        sa.Column("max_safe_ethanol_pct", sa.Integer(), nullable=False),
        sa.Column("source_reference", sa.Text(), nullable=True),
    )
    op.create_index("ix_vehicle_registry_specs_make", "vehicle_registry_specs", ["make"])
    op.create_index("ix_vehicle_registry_specs_model", "vehicle_registry_specs", ["model"])
    op.create_index("ix_vehicle_registry_specs_mfg_year", "vehicle_registry_specs", ["mfg_year"])

    op.create_table(
        "user_profiles",
        sa.Column("user_id", UUID(as_uuid=True), primary_key=True),
        sa.Column("display_name", sa.String(80), nullable=True),
        sa.Column("role", sa.String(20), server_default="user"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "consumer_fault_reports",
        sa.Column("report_id", sa.Integer(), primary_key=True),
        sa.Column(
            "vehicle_spec_id",
            sa.Integer(),
            sa.ForeignKey("vehicle_registry_specs.spec_id"),
            nullable=True,
        ),
        sa.Column("reported_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("mileage_drop_pct", sa.Numeric(4, 2), nullable=True),
        sa.Column("has_fuel_line_leak", sa.Boolean(), server_default=sa.false()),
        sa.Column("has_starting_trouble", sa.Boolean(), server_default=sa.false()),
        sa.Column("out_of_pocket_repair_cost", sa.Numeric(10, 2), nullable=True),
        sa.Column("insurance_claim_status", sa.String(20), nullable=True),
        sa.Column("region_state", sa.String(50), nullable=True),
        sa.Column("region_district", sa.String(50), nullable=True),
        sa.Column(
            "approx_location",
            Geometry(geometry_type="POINT", srid=4326),
            nullable=True,
        ),
        sa.Column("is_verified", sa.Boolean(), server_default=sa.false()),
    )
    op.create_index(
        "idx_fault_spatial",
        "consumer_fault_reports",
        ["approx_location"],
        postgresql_using="gist",
    )

    op.create_table(
        "vehicle_submission_queue",
        sa.Column("submission_id", sa.Integer(), primary_key=True),
        sa.Column(
            "submitted_by",
            UUID(as_uuid=True),
            sa.ForeignKey("user_profiles.user_id"),
            nullable=True,
        ),
        sa.Column("make", sa.String(50), nullable=False),
        sa.Column("model", sa.String(50), nullable=False),
        sa.Column("mfg_year", sa.Integer(), nullable=False),
        sa.Column("claimed_emission_standard", sa.String(15), nullable=True),
        sa.Column("claimed_fuel_delivery_system", sa.String(20), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("status", sa.String(20), server_default="pending"),
    )


def downgrade() -> None:
    op.drop_table("vehicle_submission_queue")
    op.drop_index("idx_fault_spatial", table_name="consumer_fault_reports")
    op.drop_table("consumer_fault_reports")
    op.drop_table("user_profiles")
    op.drop_index("ix_vehicle_registry_specs_mfg_year", table_name="vehicle_registry_specs")
    op.drop_index("ix_vehicle_registry_specs_model", table_name="vehicle_registry_specs")
    op.drop_index("ix_vehicle_registry_specs_make", table_name="vehicle_registry_specs")
    op.drop_table("vehicle_registry_specs")
