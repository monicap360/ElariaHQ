import { NextResponse } from "next/server";

function notFoundApiRoot() {
  return NextResponse.json(
    {
      ok: false,
      error: "Not Found",
    },
    { status: 404 }
  );
}

export function GET() {
  return notFoundApiRoot();
}

export function POST() {
  return notFoundApiRoot();
}

export function PUT() {
  return notFoundApiRoot();
}

export function PATCH() {
  return notFoundApiRoot();
}

export function DELETE() {
  return notFoundApiRoot();
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  });
}
