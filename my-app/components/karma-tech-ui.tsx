'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Mock data
const users = [
  { id: 1, name: 'Keyboard Monkey -KBM-', username: 'KeyboardMonkey3', avatar: 'KeyboardMonkey3.jpg', bio: `🦍 multi-disciplinary degenerate. not financial advice, not real advice. advisor @evincowinerydao, @tensor_hq, co-host @rektradio_` },
  { id: 2, name: 'cobie ) ) ) )', username: 'cobie', avatar: 'cobie.jpg', bio: '@echodotxyz' },
  { id: 3, name: 'Mo Shaikh 🌐 aptOS', username: 'moshaikhs', avatar: 'moshaikhs.jpg', bio: 'Cofounder, CEO @aptoslabs prev. @Meta @BCG @BlackRock @ConsenSys @MeridioRE' },
  { id: 4, name: 'Ansem 🐂🀄️', username: 'blknoiz06', avatar: 'blknoiz06.jpg', bio: 'coldest ni**a breathing | @BullpenFi | telegram @blknoiz06 | ig @blknoiz_06 | all other clone accounts are scams' },
  { id: 5, name: 'gainzy', username: 'gainzy222', avatar: 'gainzy222.jpg', bio: 'Building.' },
]

type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
} | null;

export function KarmaTechUi() {
  const [selectedUser, setSelectedUser] = useState(null as User)

  const UserList = () => (
    <Card className="w-full bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-center mb-4">karma.tech</CardTitle>
        <CardDescription className="text-xl text-center">Connect and comment on profiles</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(user => (
            <li key={user.id} className="cursor-pointer" onClick={() => setSelectedUser(user)}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{user.name}</CardTitle>
                    <CardDescription className="text-lg">@{user.username}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{user.bio}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {selectedUser ? <p>{selectedUser.toString()}</p> : <UserList />}
      </div>
    </div>
  )
}