import { RecordModel } from 'pocketbase'
import Link from 'next/link'
import {UpdateUser} from './update-user'
import { DeleteUser } from './delete-user'

interface UserItemProps {
  user: RecordModel
}

export function UserItem({ user }: UserItemProps) {
  return (
    <>
      <div className="mb-2 w-full rounded-md bg-white p-4 md:hidden">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <UserActions user={user} />
        </div>
        <div className="flex w-full items-center justify-between pt-4">
          <div>
            <p className="text-sm font-medium">Rol</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>
      <tr className="hidden w-full border-b py-3 text-sm last-of-type:border-none md:table-row">
        <td className="whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex items-center gap-3">
            <p>{user.username}</p>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-3">
          {user.email}
        </td>
        <td className="whitespace-nowrap px-3 py-3">
          {user.role}
        </td>
        <td className="whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex justify-end gap-3">
            <UserActions user={user} />
          </div>
        </td>
      </tr>
    </>
  )
}

function UserActions({ user }: UserItemProps) {
  return (
    <>
      <UpdateUser user={user} />
      <DeleteUser user={user} />
    </>
  )
}