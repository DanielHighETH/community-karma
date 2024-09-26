'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Twitter, MessageSquare, ThumbsUp, Share2 } from 'lucide-react'

// Mock data
const users = [
  { id: 1, name: 'Keyboard Monkey -KBM-', username: 'KeyboardMonkey3', avatar: 'KeyboardMonkey3.jpg', bio: `🦍 multi-disciplinary degenerate. not financial advice, not real advice. advisor @evincowinerydao, @tensor_hq, co-host @rektradio_` },
  { id: 2, name: 'cobie ) ) ) )', username: 'cobie', avatar: 'cobie.jpg', bio: '@echodotxyz' },
  { id: 3, name: 'Mo Shaikh 🌐 aptOS', username: 'moshaikhs', avatar: 'moshaikhs.jpg', bio: 'Cofounder, CEO @aptoslabs prev. @Meta @BCG @BlackRock @ConsenSys @MeridioRE' },
  { id: 4, name: 'Ansem 🐂🀄️', username: 'blknoiz06', avatar: 'blknoiz06.jpg', bio: 'coldest ni**a breathing | @BullpenFi | telegram @blknoiz06 | ig @blknoiz_06 | all other clone accounts are scams' },
  { id: 5, name: 'gainzy', username: 'gainzy222', avatar: 'gainzy222.jpg', bio: 'Building.' },
]

const comments = [
  { id: 1, userId: 1, author: 'Bob Smith', content: 'Great profile, Alice! Your recent project on sustainable energy was truly inspiring.', likes: 15, timestamp: '2 hours ago' },
  { id: 2, userId: 1, author: 'Carol Williams', content: 'Love your work, Alice! Your insights on AI ethics are always thought-provoking.', likes: 8, timestamp: '1 day ago' },
  { id: 3, userId: 2, author: 'Alice Johnson', content: `Bob, you're awesome! Your dedication to open-source projects is admirable.`, likes: 12, timestamp: '3 days ago' },
  { id: 4, userId: 1, author: 'David Brown', content: 'Alice, your recent talk at the tech conference was a game-changer. Keep up the great work!', likes: 20, timestamp: '1 week ago' },
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [comment, setComment] = useState('')

  const handleLogin = () => {
    // Simulating Twitter login
    setIsLoggedIn(true)
  }

  const handleComment = () => {
    // Simulating comment submission
    console.log('Comment submitted:', comment)
    setComment('')
  }

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

  const ProfileView = ({ user } : { user: User}) => (
    <Card className="w-full bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <CardTitle className="text-3xl mb-2">{user?.name}</CardTitle>
            <CardDescription className="text-xl mb-4">@{user?.username}</CardDescription>
            <p className="text-lg text-gray-700">{user?.bio}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <h3 className="text-2xl font-semibold mb-6">Comments</h3>
        <ul className="space-y-6">
          {comments.filter(c => c.userId === user?.id).map(comment => (
            <li key={comment.id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-lg text-primary">{comment.author}</p>
                  <span className="text-sm text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-lg mb-4">{comment.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    {comment.likes} Likes
                  </button>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="text-lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Leave a Comment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Leave a Comment</DialogTitle>
              <DialogDescription className="text-lg">
                {!isLoggedIn && "Connect with Twitter to leave a comment"}
              </DialogDescription>
            </DialogHeader>
            {!isLoggedIn ? (
              <Button size="lg" onClick={handleLogin} className="text-lg">
                <Twitter className="mr-2 h-5 w-5" />
                Connect with Twitter
              </Button>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-lg"
                  rows={4}
                />
                <Button size="lg" onClick={handleComment} className="text-lg">Submit Comment</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Button variant="outline" size="lg" className="text-lg" onClick={() => setSelectedUser(null)}>
          Back to List
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {selectedUser ? <ProfileView user={selectedUser} /> : <UserList />}
      </div>
    </div>
  )
}