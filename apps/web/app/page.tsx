"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {api} from "@packages/backend/convex/_generated/api";

export default function Home() {
  return (
      <>
        <Authenticated>
          <UserButton />
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
      </>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUser);
  return <div>Authenticated content: {currentUser?.bio}</div>;
}