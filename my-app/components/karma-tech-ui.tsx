"use client";

import { useEffect, useState, memo } from "react";
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
import { NumberInput } from "@/components/ui/numberinput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, ThumbsUp, Share2, Search, Trash2, Flag, ThumbsDown, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import walletConnect from "@/hooks/walletConnect";
import moment from "moment";
import { shortenAddress } from "@/lib/utils";

type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
};

type Comment = {
  id: number;
  targetId: number;
  author: string;
  authorAddress: string;
  content: string;
  likes: number;
  timestamp: string;
  reported: boolean;
  reportedBy: string | null;
  reportReason: string | null;
  reportTimestamp: string | null;
  truthVotes: number;
  falseVotes: number;
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
    bio: "im greg I like football and stocks and my birthday im from kentuckey. I'm a investor. I like to golf at the golf course @gregmultiverse • subscribe for $1 ⤴️",
  },
  {
    id: 8,
    name: "TylerD 🧙‍♂️",
    username: "Tyler_Did_It",
    avatar: "Tyler_Did_It.jpg",
    bio: "NFT & Crypto news & analysis | @LuckyTraderHQ | @RugRadio | @fomohour at 10 am; Lucky Lead at 11 am | Writing The Morning Minute for 7,000+ readers | Pengu Maxi",
  },
  {
    id: 9,
    name: "Sisyphus",
    username: "0xSisyphus",
    avatar: "0xSisyphus.jpg",
    bio: "Roll boulder up hill, it rolls back down.",
  },
  {
    id: 10,
    name: "GCR",
    username: "GiganticRebirth",
    avatar: "GiganticRebirth.jpg",
    bio: "He who chases two rabbits catches neither",
  },
  {
    id: 11,
    name: "nader dabit",
    username: "dabit3",
    avatar: "dabit3.jpg",
    bio: "🇵🇸 // devrel + dx @eigenlayer @eigen_da // react, ai, & on-chain // prev @avara @celestiaorg @awscloud // contributing @lensprotocol // 🫂 @developer_dao",
  },
  {
    id: 12,
    name: "Beanie",
    username: "beaniemaxi",
    avatar: "beaniemaxi.jpg",
    bio: "Crypto native since the early days. Went all in on DeFi summer. Tripled down on NFTs before it became big. No paid promos. Not financial advice. I talk my book.",
  },
  {
    id: 13,
    name: "Frank (degod mode)",
    username: "frankdegods",
    avatar: "frankdegods.jpg",
    bio: "social experimenter @degodsnft",
  },
  {
    id: 14,
    name: "Luca Netz 🐧✳️",
    username: "LucaNetz",
    avatar: "LucaNetz.jpg",
    bio: "Striving for Greatness. @pudgypenguins @iglooinc @abstractchain",
  },
  {
    id: 15,
    name: "ZachXBT",
    username: "zachxbt",
    avatar: "zachxbt.jpg",
    bio: "Scam survivor turned 2D investigator"
  }
];

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
      className="pl-10 py-2 rounded-md focus:outline-none focus:ring-0 w-full"
    />
  </div>
);

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

const ProfileView = memo(
  ({
    user,
    comments,
    addComment,
    deleteComment,
    reportComment,
    setSelectedUser,
  }: {
    user: User;
    comments: Comment[] | null;
    addComment: (comment: Comment) => void;
    deleteComment: (id: number) => void;
    reportComment: (id: number, reason: string) => void;
    setSelectedUser: (user: User | null) => void;
  }) => {
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [reportDialogOpenNumber, setReportDialogOpenNumber] = useState<number | null>(null);
    const [commentText, setCommentText] = useState("");
    const [reportReasonText, setReportReasonText] = useState("");
    const {
      walletAvailable,
      connectWallet,
      disconnectWallet,
      address,
      isLoggedIn,
    } = walletConnect();

    const handleCommentSubmit = () => {
      if (!commentText.trim()) {
        console.error("Comment cannot be empty");
        return;
      }

      const newComment: Comment = {
        id: comments ? comments.length + 1 : 1,
        targetId: user.id,
        author: shortenAddress(address) as string,
        authorAddress: address as string,
        content: commentText,
        likes: 0,
        timestamp: new Date().toISOString(),
        reported: false,
        reportedBy: null,
        reportReason: null,
        reportTimestamp: null,
        truthVotes: 0,
        falseVotes: 0,
      };

      addComment(newComment);
      setCommentText("");
      setCommentDialogOpen(false);
    };

    const handleReportSubmit = () => {
      if (!reportReasonText.trim()) {
        console.error("Report reason cannot be empty");
        return;
      }

      reportComment(reportDialogOpenNumber as number, reportReasonText);
      setReportReasonText("");
      setReportDialogOpenNumber(null);
    };

    return (
      <Card className="w-full bg-white/90 backdrop-blur-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left w-full">
              <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
              <CardDescription className="text-xl mb-4">
                @{user.username}
              </CardDescription>
              <p className="text-lg text-gray-700 w-3/4">{user.bio}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-2xl font-semibold mb-6">Notes</h3>
          <ul className="space-y-6 max-h-100 overflow-y-auto">
            {!comments ? (
              <p className="text-gray-500 text-center mt-16 mb-16">
                Loading...
              </p>
            ) : comments.filter((c) => c.targetId === user.id && !c.reported).length === 0 ? (
              <p className="text-gray-500 text-center mt-16 mb-16">
                No notes found
              </p>
            ) : (
              comments
                .filter((c) => c.targetId === user.id && !c.reported)
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
                          {moment(comment.timestamp).local().fromNow()}
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
                        <button 
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          onClick={() => setReportDialogOpenNumber(comment.id)}
                        >
                          <Flag className="w-4 h-4" />
                          Report
                        </button>
                        {comment.authorAddress === address && (
                          <button
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={() => deleteComment(comment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))
            )}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            size="lg"
            className="text-lg"
            onClick={() => setCommentDialogOpen(true)}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Leave a Comment
          </Button>
          <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
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
                      <Textarea
                        placeholder="Your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="text-lg"
                        rows={4}
                      />
                      <Button
                        size="lg"
                        onClick={handleCommentSubmit}
                        className="text-lg w-full"
                      >
                        Submit Comment
                      </Button>
                      <p className="flex justify-between items-center">
                        <span>Logged in as: {shortenAddress(address)}</span>
                        <span
                          onClick={disconnectWallet}
                          className="cursor-pointer"
                        >
                          Logout
                        </span>
                      </p>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      onClick={connectWallet}
                      className="text-lg"
                    >
                      Connect with your wallet
                    </Button>
                  )}
                </>
              ) : (
                <p>Petra Wallet is not available. Please install it.</p>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={reportDialogOpenNumber !== null} onOpenChange={() => setReportDialogOpenNumber(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Report a note</DialogTitle>
                <DialogDescription className="text-lg">
                  {!isLoggedIn && "Connect with your wallet to report a note"}
                </DialogDescription>
              </DialogHeader>
              {walletAvailable ? (
                <>
                  {isLoggedIn ? (
                    <>
                      <Textarea
                        placeholder="Your reasoning for reporting..."
                        value={reportReasonText}
                        onChange={(e) => setReportReasonText(e.target.value)}
                        className="text-lg"
                        rows={4}
                      />
                      <Button
                        size="lg"
                        onClick={handleReportSubmit}
                        className="text-lg w-full"
                      >
                        Submit Report
                      </Button>
                      <p className="flex justify-between items-center">
                        <span>Logged in as: {shortenAddress(address)}</span>
                        <span
                          onClick={disconnectWallet}
                          className="cursor-pointer"
                        >
                          Logout
                        </span>
                      </p>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      onClick={connectWallet}
                      className="text-lg"
                    >
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
  }
);

const OracleView = memo(
  ({
    users,
    comments,
    setComments,
  }: {
    users: User[];
    comments: Comment[] | null;
    setComments: (comments: Comment[] | null) => void;
  }) => {
    const {
      walletAvailable,
      connectWallet,
      disconnectWallet,
      address,
      isLoggedIn,
    } = walletConnect();
    const [vote, setVote] = useState<boolean | null>(null);
    const [voteAmount, setVoteAmount] = useState<number | null>(null);
    const [voteId, setVoteId] = useState<number | null>(null);

    const handleVote = (id: number, vote: boolean) => () => {
      setVoteId(id);
      setVote(vote);
    }

    const handleVoteNumberChange = (value: number) => {
      setVoteAmount(value);
    }

    const handleVoteSubmit = () => {
      if (voteId === null || vote === null) {
        console.error("Vote ID and vote value must be set");
        return;
      }

      setComments(
        comments?.map((c) => {
          if (c.id === voteId) {
            return { ...c, [vote ? "truthVotes" : "falseVotes"]: c[vote ? "truthVotes" : "falseVotes"] + (voteAmount as number)};
          }
          return c;
        }) || null
      );

      setVote(null);
      setVoteId(null);

      fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: voteId, vote, voteAmount }),
      });
    }

    function getTimeLeft(timestamp: string) {
      const reportTime = new Date(timestamp).getTime()
      const now = new Date().getTime()
      const timeLeft = reportTime + 72 * 60 * 60 * 1000 - now

      if (timeLeft <= 0) {
        return "Voting closed"
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

      return `${hours}h ${minutes}m left`
    }

    return (
      <>
        <Dialog open={vote !== null} onOpenChange={() => setVote(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Choose number of {!vote ? 'False' : 'Truth'} votes</DialogTitle>
                <DialogDescription className="text-lg">
                  {!isLoggedIn && "Connect with your wallet to submit a vote"}
                </DialogDescription>
              </DialogHeader>
              {walletAvailable ? (
                <>
                  {isLoggedIn ? (
                    <>
                        <NumberInput
                          min={1000}
                          max={100000}
                          step={1000}
                          defaultValue={10000}
                          onChange={handleVoteNumberChange}
                        />
                      <Button
                        size="lg"
                        onClick={handleVoteSubmit}
                        className="text-lg w-full"
                      >
                        Submit Vote
                      </Button>
                      <p className="flex justify-between items-center">
                        <span>Logged in as: {shortenAddress(address)}</span>
                        <span
                          onClick={disconnectWallet}
                          className="cursor-pointer"
                        >
                          Logout
                        </span>
                      </p>
                    </>
                  ) : (
                    <Button
                      size="lg"
                      onClick={connectWallet}
                      className="text-lg"
                    >
                      Connect with your wallet
                    </Button>
                  )}
                </>
              ) : (
                <p>Petra Wallet is not available. Please install it.</p>
              )}
            </DialogContent>
          </Dialog>

          <ul className="grid grid-cols-1 gap-6 max-h-90 overflow-y-auto">
            {
              !comments ? (
                  <p className="text-gray-500 text-center mt-16 mb-16">
                    Loading...
                  </p>
                ) : comments.filter((comment) => comment.reported && !moment().local().subtract(3, 'days').isAfter(moment(comment.reportTimestamp).local())).length === 0 ? (
                  <p className="text-gray-500 text-center mt-16 mb-16">
                    No notes found
                  </p>
                ) : 
              comments?.filter((comment) => comment.reported && !moment().local().subtract(3, 'days').isAfter(moment(comment.reportTimestamp).local())).map((comment) => {
                const author = users.find((u) => u.id === comment.targetId);
                return (
                  <li
                    key={comment.id}
                    className="bg-gray-50 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="px-4">
                      <div className='flex'>
                        <img className='m-auto w-[15rem] h-[15rem] object-cover' src={author?.avatar} alt={author?.name} />
                      <div className='w-[70%]'>
                        <CardContent className='pb-0  pt-8'>
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2 text-sm">Original Note On {author?.name}'s profile:</h3>
                            <div className="border-l-4 border-gray-300 pl-4 py-2 bg-gray-100 rounded">
                              <p className="text-md text-gray-600">{comment?.content}</p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2 text-sm">Report Reason:</h3>
                            <p className="text-md">{comment?.reportReason}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                          <div className="flex space-x-4">
                            <Button variant="outline" className="flex items-center space-x-2" onClick={handleVote(comment?.id, true)}>
                              <ThumbsUp className="w-4 h-4" />
                              <span>Truth ({comment?.truthVotes || 0})</span>
                            </Button>
                            <Button variant="outline" className="flex items-center space-x-2"onClick={handleVote(comment?.id, false)}>
                              <ThumbsDown className="w-4 h-4" />
                              <span>False ({comment?.falseVotes || 0})</span>
                            </Button>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{getTimeLeft(comment?.reportTimestamp as string)}</span>
                          </div>
                        </CardFooter>
                      </div>
                      </div>
                    </div>
                  </li>
                );
              }
            )}
          </ul>
    </>
      
    );
  });

export function KarmaTechUi() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [shuffledUsers, setShuffledUsers] = useState<User[]>([]);
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [activeView, setActiveView] = useState("community");
  const {
      address,
    } = walletConnect();

  useEffect(() => {
    const shuffleArray = (array: any[]) => {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
          shuffledArray[j],
          shuffledArray[i],
        ];
      }
      return shuffledArray;
    };

    const shuffled = shuffleArray(users);
    setShuffledUsers(shuffled);
    setDisplayUsers(shuffled);

    fetch("/api/init-data")
      .then((res) => res.json())
      .then((data) => {
        const comments: Comment[] = data.map((c: any) => ({
          id: c.id,
          targetId: c.target_id,
          author: c.author,
          authorAddress: c.author_address,
          content: c.content,
          likes: c.likes,
          timestamp: c.timestamp,
          reported: c.reported,
          reportedBy: c.reported_by,
          reportReason: c.report_reason,
          reportTimestamp: c.report_timestamp,
          truthVotes: c.truth_votes,
          falseVotes: c.false_votes
        }));
        setComments(comments);
      });
  }, []);

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDisplayUsers(
      shuffledUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(value.toLowerCase()) ||
          user.username.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const addComment = (newComment: Comment) => {
    setComments((prevComments) =>
      prevComments ? [...prevComments, newComment] : [newComment]
    );

    fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newComment),
    });
  };

  const deleteComment = (id: number) => {
    setComments(
      (prevComments) => prevComments?.filter((c) => c.id !== id) || null
    );

    fetch("/api/delete-comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  };

  const reportComment = (id: number, reason: string) => {
    setComments(
      (prevComments) => prevComments?.map((c) => {
        if (c.id === id) {
          return { ...c, reported: true, reportedBy: address as string, reportReason: reason };
        }
        return c;
      }) || null
    );

    fetch("/api/report-comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, reportReason: reason }),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-8 max-h-96 overflow-y-hidden">
      <div className="w-full max-w-6xl">
        {selectedUser ? (
          <ProfileView
            user={selectedUser}
            comments={comments}
            addComment={addComment}
            deleteComment={deleteComment}
            reportComment={reportComment}
            setSelectedUser={setSelectedUser}
          />
        ) : (
          <>
            <div className='b-6 flex text-black justify-between'>
             <div className="flex items-center bg-white rounded-md shadow-lg mb-6">
                <button
                  className={`px-4 py-2 rounded-l-md transition-colors duration-300 ease-in-out ${
                    activeView === "community" ? "bg-primary text-primary-foreground" : "text-black"
                  }`}
                  onClick={() => handleViewChange("community")}
                >
                  Community View
                </button>
                <button
                  className={`px-4 py-2 rounded-r-md transition-colors duration-300 ease-in-out ${
                    activeView === "voting" ? "bg-primary text-primary-foreground" : "text-black"
                  }`}
                  onClick={() => handleViewChange("voting")}
                >
                  Voting View
                </button>
              </div>
              {activeView === "community" && (
                <div className="mb-6 text-black">
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                  />
                </div>
              )}
            </div>
            <Card className="w-full bg-white/90 backdrop-blur-sm">
              {activeView === "community" ? (
                <>
                  <CardHeader>
                    <CardTitle className="text-4xl font-bold text-center mt-4">
                      karma.tech
                    </CardTitle>
                    <CardDescription className="text-xl text-center">
                      Check Influencer Karma, Guaranteed by Onchain Oracle
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserList
                      filteredUsers={displayUsers.slice(0, 9)}
                      onSelectUser={setSelectedUser}
                    />
                  </CardContent>
                </> ) : (
                  <>
                    <CardHeader>
                      <CardTitle className="text-4xl font-bold text-center mt-4">
                        karma.tech
                      </CardTitle>
                      <CardDescription className="text-xl text-center">
                        Cast Votes with $KARMA, Help Determine the Truth, Get Rewarded
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OracleView
                        users={users}
                        comments={comments}
                        setComments={setComments}
                      />
                    </CardContent>
                  </>
                  )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
