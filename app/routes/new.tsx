import { IdentificationIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Prisma } from "@prisma/client";
import { ActionFunction, LoaderFunction, TypedResponse, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { prisma } from "~/database/client";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

/**
 * The `action` function is called when a form is submitted.
 */
type ActionResponse = { error?: string };
export const action: ActionFunction = async ({ params, request }): Promise<TypedResponse<ActionResponse>> => {
  const formData = await request.formData();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  if (firstName && lastName && phone ) {
    await prisma.phoneBook.create({
      data: {
        firstName,
        lastName,
        phone,
      }
    });
  }
  return redirect("/");
};

/**
 * The `loader` function is called when the route is loaded.
 */
export const loader: LoaderFunction = async () => {
  return json({});
};

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-gray-200 shadow-md rounded-md p-4 w-full max-w-md">
        <div className="flex flex-row justify-center space-x-2 items-center">
          <IdentificationIcon className="h-8 w-8" />
          <h1 className="flex flex-row text-center font-bold text-lg">Phone Book App</h1>
        </div>
        <div className="flex flex-row justify-between space-x-2 items-center pt-3">
          <span className="text-md font-bold">New Contact</span>
        </div>
        <form method="post" className="flex flex-col justify-center space-y-2 items-center pt-2">
          <div className="flex flex-row border bg-white border-gray-300 rounded p-2 px-3 w-full items-center space-x-2">
            <input
              type="search"
              name="firstName"
              className="bg-transparent focus:outline-none w-full"
              placeholder="Search for contact by last name..."
            />
          </div>
          <div className="flex flex-row border bg-white border-gray-300 rounded p-2 px-3 w-full items-center space-x-2">
            <input
              type="search"
              name="lastName"
              className="bg-transparent focus:outline-none w-full"
              placeholder="Search for contact by last name..."
            />
          </div>
          <div className="flex flex-row border bg-white border-gray-300 rounded p-2 px-3 w-full items-center space-x-2">
            <input
              type="search"
              name="phone"
              className="bg-transparent focus:outline-none w-full"
              placeholder="Search for contact by last name..."
            />
          </div>
          <div className="flex flex-row w-full items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >Save</button>
            <button
              type="button"
              className="bg-red-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate("/")}
            >Go back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
