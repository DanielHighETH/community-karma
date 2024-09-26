"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Twitter, MessageSquare, ThumbsUp, Share2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data
const users = [
  {
    id: 1,
    name: "Keyboard Monkey -KBM-",
    username: "KeyboardMonkey3",
    avatar: "KeyboardMonkey3.jpg",
    bio: `🦍 multi-disciplinary degenerate. not financial advice, not real advice. advisor @evincowinerydao, @tensor_hq, co-host @rektradio_`,
  },
  {
    id: 2,
    name: "olimpio",
    username: "OlimpioCrypto",
    avatar: "OlimpioCrypto.png",
    bio: "Sharing cryptocurrency events, yield farming, DeFi, & airdrop strategies. Daily news: @AlphaPackedHQ. Investing: @OlimpioCapital. Finding airdrops: @earndrop_io",
  },
  {
    id: 3,
    name: "Mo Shaikh 🌐 aptOS",
    username: "moshaikhs",
    avatar: "moshaikhs.jpg",
    bio: "Cofounder, CEO @aptoslabs prev. @Meta @BCG @BlackRock @ConsenSys @MeridioRE",
  },
  {
    id: 4,
    name: "Ansem 🐂🀄️",
    username: "blknoiz06",
    avatar: "blknoiz06.jpg",
    bio: "coldest ni**a breathing | @BullpenFi | telegram @blknoiz06 | ig @blknoiz_06 | all other clone accounts are scams",
  },
  {
    id: 5,
    name: "il Capo Of Crypto",
    username: "CryptoCapo_",
    avatar: "CryptoCapo_.jpg",
    bio: `#Crypto analyst, Swing Trader and Long-term Investor since Feb 2017 | Not financial advice | I will never DM you first. Free TG: http://t.me/CryptoCapoTG`,
  },
  {
    id: 6,
    name: "wallstreetbets",
    username: "wallstreetbets",
    avatar: "wallstreetbets.jpg",
    bio: "Like 4chan found a Bloomberg terminal.",
  },
];

const comments = [
  {
    id: 1,
    userId: 1,
    author: "Bob Smith",
    content:
      "Great profile, Alice! Your recent project on sustainable energy was truly inspiring.",
    likes: 15,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    userId: 1,
    author: "Carol Williams",
    content:
      "Love your work, Alice! Your insights on AI ethics are always thought-provoking.",
    likes: 8,
    timestamp: "1 day ago",
  },
  {
    id: 3,
    userId: 2,
    author: "Alice Johnson",
    content: `Bob, you're awesome! Your dedication to open-source projects is admirable.`,
    likes: 12,
    timestamp: "3 days ago",
  },
  {
    id: 4,
    userId: 1,
    author: "David Brown",
    content:
      "Alice, your recent talk at the tech conference was a game-changer. Keep up the great work!",
    likes: 20,
    timestamp: "1 week ago",
  },
];

// SearchInput component
const SearchInput = ({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative">
    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
    <input
      type="text"
      placeholder="Search users..."
      value={searchTerm}
      onChange={onSearchChange}
      className="pl-10 py-2"
    />
  </div>
);

// UserList component
const UserList = ({
  filteredUsers,
  onSelectUser,
}: {
  filteredUsers: any[];
  onSelectUser: (user: any) => void;
}) => (
  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredUsers.map((user) => (
      <li
        key={user.id}
        className="cursor-pointer"
        onClick={() => onSelectUser(user)}
      >
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl line-clamp-1">
                {user.name}
              </CardTitle>
              <CardDescription className="text-lg">
                @{user.username}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);

export function KarmaTechUi() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [comment, setComment] = useState("");

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleComment = () => {
    console.log("Comment submitted:", comment);
    setComment("");
  };

  const ProfileView = ({ user }: { user: any }) => (
    <Card className="w-full bg-white/90 backdrop-blur-sm">
      <CardHeader className="border-b">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left w-full">
            <CardTitle className="text-3xl mb-2">{user?.name}</CardTitle>
            <CardDescription className="text-xl mb-4">
              @{user?.username}
            </CardDescription>
            <p className="text-lg text-gray-700 w-3/4">{user?.bio}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <h3 className="text-2xl font-semibold mb-6">Comments</h3>
        <ul className="space-y-6">
          {comments
            .filter((c) => c.userId === user?.id)
            .map((comment) => (
              <li
                key={comment.id}
                className="bg-gray-50 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-lg text-primary">
                      {comment.author}
                    </p>
                    <span className="text-sm text-gray-500">
                      {comment.timestamp}
                    </span>
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
                <Button size="lg" onClick={handleComment} className="text-lg">
                  Submit Comment
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="lg"
          className="text-lg"
          onClick={() => setSelectedUser(null)}
        >
          Back to List
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {selectedUser ? (
          <ProfileView user={selectedUser} />
        ) : (
          <Card className="w-full bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-center mb-4">
                karma.tech
              </CardTitle>
              <CardDescription className="text-xl text-center">
                Connect and comment on profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
              </div>
              <UserList
                filteredUsers={filteredUsers}
                onSelectUser={setSelectedUser}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
