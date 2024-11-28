import React from 'react'

export function UserListSkeleton() {
  const skeletonItem = (
    <>
      <div className="mb-2 w-full rounded-md bg-white p-4 md:hidden">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between pt-4">
          <div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
      <tr className="hidden w-full border-b py-3 text-sm last-of-type:border-none md:table-row">
        <td className="whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
        </td>
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
        </td>
        <td className="whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex justify-end gap-3">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
          </div>
        </td>
      </tr>
    </>
  )

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i}>{skeletonItem}</div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Nombre de usuario
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Rol
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(5)].map((_, i) => (
                <React.Fragment key={i}>{skeletonItem}</React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
