import { expect } from "chai";
import hre from "hardhat";

describe("Voting", function () {
  it("Should mint and vote", async function () {
    const Voting = await hre.ethers.getContractFactory("VotingSystem");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    const [owner, Aziz, notVoter] = await hre.ethers.getSigners();

    await voting.mint(owner.address, 100);
    await voting.mint(Aziz.address, 100);

    await voting.connect(owner).submitProposal("Proposal 1");
    await voting.connect(Aziz).submitProposal("Proposal 2");

    await voting.connect(owner).vote1(0, true);
    await voting.connect(Aziz).vote1(1, false);

    const proposal1 = await voting.proposals(0);
    const proposal2 = await voting.proposals(1);

    expect(proposal1.yesVotes).to.equal(1);
    expect(proposal1.noVotes).to.equal(0);
    expect(proposal2.yesVotes).to.equal(0);
    expect(proposal2.noVotes).to.equal(1);
  });
  it("Should not allow voting without tokens", async function () {
    const Voting = await hre.ethers.getContractFactory("VotingSystem");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();
  
    const [owner, voter, notVoter] = await hre.ethers.getSigners();
  
    await voting.connect(owner).submitProposal("Proposal 1");
  
    await expect(
      voting.connect(notVoter).vote1(0, true)
    ).to.be.revertedWith("No tokens to vote");
  });
  
  it("Should not allow double voting", async function () {
    const Voting = await hre.ethers.getContractFactory("VotingSystem");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();
  
    const [owner, voter] = await hre.ethers.getSigners();
  
    await voting.mint(voter.address, 100);
    await voting.connect(owner).submitProposal("Proposal 1");
  
    await voting.connect(voter).vote1(0, true);
  
    await expect(
      voting.connect(voter).vote1(0, false)
    ).to.be.revertedWith("Already voted");
  });
  
  it("Should approve proposal if majority votes yes", async function () {
    const Voting = await hre.ethers.getContractFactory("VotingSystem");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();
  
    const [owner, voter1, voter2, voter3] = await hre.ethers.getSigners();
  
    await voting.mint(voter1.address, 100);
    await voting.mint(voter2.address, 100);
    await voting.mint(voter3.address, 100);
  
    await voting.connect(owner).submitProposal("Proposal 1");
  
    await voting.connect(voter1).vote1(0, true);
    await voting.connect(voter2).vote1(0, true);
    await voting.connect(voter3).vote1(0, false);
  
    const proposal = await voting.proposals(0);
    expect(proposal.yesVotes).to.equal(2);
    expect(proposal.noVotes).to.equal(1);
    expect(proposal.isApproved).to.be.true;
  });
});

