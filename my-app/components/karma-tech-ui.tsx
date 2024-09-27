"use client";

import { useEffect, useState } from "react";
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
import walletConnect from '@/hooks/walletConnect';

type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
};

type Comment = {
  id: number;
  targetid: number;
  author: string;
  content: string;
  likes: number;
  timestamp: string;
};

const users: User[] = [
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
  {
    id: 7,
    name: "greg",
    username: "greg16676935420",
    avatar: "greg16676935420.jpg",
    bio: "im greg I like football and stocks and my birthday im from kentuckey. I'm a investor. I like to golf at the golf course @gregmultiverse • subscribe for $1 ⤴️"
  },
  {
    id: 8,
    name: "TylerD 🧙‍♂️",
    username: "Tyler_Did_It",
    avatar: "Tyler_Did_It.jpg",
    bio: "NFT & Crypto news & analysis | @LuckyTraderHQ | @RugRadio | @fomohour at 10 am; Lucky Lead at 11 am | Writing The Morning Minute for 7,000+ readers | Pengu Maxi"
  },
  {
    id: 9,
    name: "Sisyphus",
    username: "0xSisyphus",
    avatar: "0xSisyphus.jpg",
    bio: "Roll boulder up hill, it rolls back down."
  },
  {
    id: 10,
    name: "GCR",
    username: "GiganticRebirth",
    avatar: "GiganticRebirth.jpg",
    bio: "He who chases two rabbits catches neither"
  },
  {
    id: 11,
    name: "nader dabit",
    username: "dabit3",
    avatar: "dabit3.jpg",
    bio: "🇵🇸 // devrel + dx @eigenlayer @eigen_da // react, ai, & on-chain // prev @avara @celestiaorg @awscloud // contributing @lensprotocol // 🫂 @developer_dao"
  },
  {
    id: 12,
    name: "Beanie",
    username: "beaniemaxi",
    avatar: "beaniemaxi.jpg",
    bio: "Crypto native since the early days. Went all in on DeFi summer. Tripled down on NFTs before it became big. No paid promos. Not financial advice. I talk my book."
  },
  {
    id: 13,
    name: "Frank (degod mode)",
    username: "frankdegods",
    avatar: "frankdegods.jpg",
    bio: "social experimenter @degodsnft"
  },
  {
    id: 14,
    name: "Luca Netz 🐧✳️",
    username: "LucaNetz",
    avatar: "LucaNetz.jpg",
    bio: "Striving for Greatness. @pudgypenguins @iglooinc @abstractchain"
  }
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
      className="pl-10 py-2 rounded-md focus:outline-none focus:ring-0"
    />
  </div>
);

// UserList component
const UserList = ({
  filteredUsers,
  onSelectUser,
}: {
  filteredUsers: User[];
  onSelectUser: (user: User) => void;
}) => (
  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[calc(2*12rem)]">
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
  const [comment, setComment] = useState("");
  const [shuffledUsers, setShuffledUsers] = useState<any[]>([]);
  const [displayUsers, setDisplayUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[] | null>(null);

  const {
    walletAvailable,
    connectWallet,
    disconnectWallet,
    address,
    isLoggedIn,
  } = walletConnect();

  const shuffleArray = (array: any[]) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  useEffect(() => {
   const shuffled = shuffleArray(users);
    setShuffledUsers(shuffled);
    setDisplayUsers(shuffled);

    fetch("/api/init-data")
      .then((res) => res.json())
      .then((data) => {
        console.log("Comments fetched:", data);
        setComments(data);
      });
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Search term:", e.target.value);
    setDisplayUsers(shuffledUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
      user.username.toLowerCase().includes(e.target.value.toLowerCase())
  ));
    setSearchTerm(e.target.value);
  };

  const handleComment = () => {
    console.log("Comment submitted:", comment);
    setComment("");
  };

  const ProfileView = ({ user }: { user: User }) => (
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
          {!comments ?  (
            <p className="text-gray-500 text-center mt-16 mb-16">Loading...</p>
          ) : comments.filter((c) => c.targetid === user?.id).length === 0 ? (
            <p className="text-gray-500 text-center mt-16 mb-16">No comments found</p>
          ) : comments
            .filter((c) => c.targetid === user?.id)
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
                {!isLoggedIn && "Connect with your wallet to leave a comment"}
              </DialogDescription>
            </DialogHeader>
            {walletAvailable ? (
                <>
                  {isLoggedIn ? (
                    <>
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
                    <div>
                      <p>
                        Logged in as: {address}
                      </p>
                      <button onClick={disconnectWallet}>
                        Disconnect Wallet / Logout
                      </button>
                    </div>
                    </>
                  ) : (
                    <Button size="lg" onClick={connectWallet} className="text-lg">
                      Connect with your wallet
                    </Button>
                  )}
                </>
              ) : (
                <p>Petra Wallet is not available. Please install it.</p>
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
          <>
            <div className="mb-6 flex justify-end text-black">
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
            </div>
            <Card className="w-full bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-center mt-4">
                  karma.tech
                </CardTitle>
                <CardDescription className="text-xl text-center">
                  truth index of your favorite crypto influencers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserList
                  filteredUsers={displayUsers.slice(0, 6)}
                  onSelectUser={setSelectedUser}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
