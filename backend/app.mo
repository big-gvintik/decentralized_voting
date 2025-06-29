import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";

actor Voting {

  public type VoteResult = Result.Result<Text, Text>;

  public type Poll = {
    id: Nat;
    question: Text;
    options: [Text];
    votes: [Nat];
    voters: [Principal];
  };

  stable var polls: [Poll] = [];

  public func createPoll(question: Text, options: [Text]) : async Nat {
    let votes = Array.tabulate<Nat>(options.size(), func _ = 0);
    let poll: Poll = {
      id = polls.size();
      question = question;
      options = options;
      votes = votes;
      voters = [];
    };
    polls := Array.append(polls, [poll]);
    return poll.id;
  };

  public shared (msg) func vote(pollId: Nat, optionIndex: Nat) : async VoteResult {
    if (pollId >= polls.size()) {
      return #err("Poll not found");
    };

    let poll = polls[pollId];

    if (optionIndex >= poll.options.size()) {
      return #err("Invalid option index");
    };

    let alreadyVoted = Array.find<Principal>(poll.voters, func (p : Principal) : Bool {
      Principal.equal(p, msg.caller)
    });

    if (alreadyVoted != null) {
      return #err("You already voted");
    };

    let newVotes = Array.tabulate<Nat>(poll.votes.size(), func (i) {
      if (i == optionIndex) { poll.votes[i] + 1 } else { poll.votes[i] }
    });

    let updatedPoll: Poll = {
      id = poll.id;
      question = poll.question;
      options = poll.options;
      votes = newVotes;
      voters = Array.append(poll.voters, [msg.caller]);
    };

    polls := Array.tabulate<Poll>(polls.size(), func (i: Nat) {
      if (i == pollId) { updatedPoll } else { polls[i] }
    });

    return #ok("Vote recorded");
  };

  public query func getPoll(pollId: Nat) : async ?Poll {
    if (pollId >= polls.size()) {
      return null;
    };
    ?polls[pollId]
  };

  public query func getAllPolls() : async [(Nat, Text)] {
    Array.map<Poll, (Nat, Text)>(polls, func (p: Poll) {
      (p.id, p.question)
    });
  };

  public func deletePoll(pollId: Nat) : async Result.Result<Text, Text> {
    if (pollId >= polls.size()) {
      return #err("Poll not found");
    };

    let updatedPolls = Array.filter<Poll>(polls, func (p) {
      p.id != pollId
    });

    let renumbered = Array.tabulate<Poll>(updatedPolls.size(), func (i) {
      let p = updatedPolls[i];
      {
        id = i;
        question = p.question;
        options = p.options;
        votes = p.votes;
        voters = p.voters;
      }
    });

    polls := renumbered;
    return #ok("Poll deleted");
  };
};