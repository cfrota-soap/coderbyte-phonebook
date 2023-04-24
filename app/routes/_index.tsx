import { IdentificationIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PhoneIcon } from "@heroicons/react/24/solid";
import type { Prisma } from "@prisma/client";
import type { ActionFunction, LoaderFunction, TypedResponse, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { prisma } from "~/database/client";

export const meta: V2_MetaFunction = () => {
  return [{ title: "New Remix App" }];
};

/**
 * The `action` function is called when a form is submitted.
 */
type ActionResponse = { error?: string };
export const action: ActionFunction = async ({ request }): Promise<TypedResponse<ActionResponse>> => {
  try {
    const body = new URLSearchParams(await request.text());
    const action = body.get("action");
    const id = Number.parseInt(body.get("id") as string);
    switch (action) {
      case "delete":
        await prisma.phoneBook.delete({ where: { id } });
    }
    return json({}, 200);
  } catch (e) {
    console.log(e);
    return json<ActionResponse>({ error: "generic.error.internalServerError" }, 500);
  }
};

/**
 * The `loader` function is called when the route is loaded.
 */
type LoaderResponse = { items: Prisma.PhoneBookGetPayload<{}>[] } | { error?: string };
export const loader: LoaderFunction = async (): Promise<TypedResponse<LoaderResponse>> => {
  try {
    const items = await prisma.phoneBook.findMany();
    return json<LoaderResponse>({ items: items ?? [] });
  } catch (e) {
    console.log(e);
    return json<LoaderResponse>({ error: "generic.error.internalServerError" }, 500);
  }
};

export default function Index() {
  // Get the data from the loader function and the action function.
  const loaderData = useLoaderData<LoaderResponse>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const items = loaderData && "items" in loaderData ? loaderData.items : [];

  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  useEffect(() => {
    setFilteredItems(items.filter((item) => item.lastName.toLowerCase().includes(search.toLowerCase())));
  }, [search]);

  // Handle the delete action.
  async function handleDelete(item: number) {
    if (confirm("Are you sure you want to delete this contact?")) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("id", item.toString());
      try {
        await submit(formData, { method: "post" });
        // Update the UI after successful deletion
        setFilteredItems(filteredItems.filter((i) => i.id !== item));
      } catch (error) {
        console.error("Error deleting contact:", error);
        // Handle error if necessary
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="bg-gray-200 shadow-md rounded-md p-4 w-full max-w-md">
        <div className="flex flex-row justify-center space-x-2 items-center">
          <IdentificationIcon className="h-8 w-8" />
          <h1 className="flex flex-row text-center font-bold text-lg">Phone Book App</h1>
        </div>
        <div className="flex flex-row justify-between space-x-2 items-center pt-3">
          <span className="text-md font-bold">Contacts</span>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate("/new")}
          >
            + Add Contact
          </button>
        </div>
        <div className="flex flex-row justify-center space-x-2 items-center pt-2">
          <div className="flex flex-row border bg-white border-gray-300 rounded p-2 px-3 w-full items-center space-x-2">
            <MagnifyingGlassIcon className="h-4 w-4" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="bg-transparent focus:outline-none w-full"
              placeholder="Search for contact by last name..."
            />
          </div>
        </div>
        <div className="flex border bg-white overflow-hidden border-gray-300 rounded-lg flex-row justify-center space-x-2 items-center mt-2">
          <div className="flex flex-col border border-gray-300 rounded w-full items-center">
            {filteredItems &&
              filteredItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row w-full items-center space-y-1 justify-between p-2 px-3 border-b border-gray-300"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">
                      {item.firstName} {item.lastName}
                    </span>
                    <div className="flex flex-row text-sm font-medium text-gray-400 items-center space-x-2">
                      <PhoneIcon className="h-4 w-4" /> <span>{item.phone}</span>
                    </div>
                  </div>
                  <button className="text-white font-bold bg-red-500 rounded p-2">
                    <TrashIcon className="h-6 w-6" onClick={() => handleDelete(item.id)} />
                  </button>
                </div>
              ))}
            {(!filteredItems || filteredItems.length === 0) && (
              <div className="flex flex-row w-full items-center space-y-1 justify-between p-2 px-3 border-b border-gray-300">
                <div className="flex flex-col">
                  <span>No results.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
