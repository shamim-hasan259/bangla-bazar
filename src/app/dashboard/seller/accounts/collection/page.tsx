import CollectionForm from "./collectionForm";

export default async function CollectionPage() {
  // const data: any = await prisma.collections.findMany(); //

  const data = [];

  //  ("collectionData", collectionsData);

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className=" space-y-2">
            <div className="flex items-center w-full  space-x-2">
              <CollectionForm entry={data} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            {/* <UserDataTable columns={columns} data={data} /> */}
          </div>
        </div>
      </div>
    </main>
  );
}
