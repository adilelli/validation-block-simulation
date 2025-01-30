import express, { Request, Response } from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

class Block {
  index: number;
  timestamp: number;
  data: Data;
  previousHash: string;
  hash: string;

  constructor(index: number, previousHash: string, data: Data) {
    this.index = index;
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return crypto
      .createHash("sha256")
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data))
      .digest("hex");
  }
}

class Data{
  TERMS_CHANGEBLE: boolean;
  WILL_DATA_SEND_TO_3RD_PARTY: boolean;
  WILL_APP_TURN_INTO_SUBSCRIPTION: boolean;
  WILL_USERS_OWN_THEIR_WORK: boolean;
  WILL_USER_DATA_USED_FOR_AI_TRAINING: boolean;
  constructor(TERMS_CHANGEBLE: boolean, WILL_DATA_SEND_TO_3RD_PARTY: boolean, WILL_APP_TURN_INTO_SUBSCRIPTION: boolean, WILL_USERS_OWN_THEIR_WORK: boolean, WILL_USER_DATA_USED_FOR_AI_TRAINING: boolean) {
    this.TERMS_CHANGEBLE = TERMS_CHANGEBLE;
    this.WILL_DATA_SEND_TO_3RD_PARTY = WILL_DATA_SEND_TO_3RD_PARTY;
    this.WILL_APP_TURN_INTO_SUBSCRIPTION = WILL_APP_TURN_INTO_SUBSCRIPTION;
    this.WILL_USERS_OWN_THEIR_WORK = WILL_USERS_OWN_THEIR_WORK;
    this.WILL_USER_DATA_USED_FOR_AI_TRAINING = WILL_USER_DATA_USED_FOR_AI_TRAINING;
  }
}

class modifyData{
  index: number;
  data: Data;

  constructor(index: number, data: Data) {
    this.index = index;
    this.data = data;
  }
}

class Blockchain {
  private chain: Block[];

  constructor() {
    const data = new Data(
      false,
      false,
      false,
      false,
      false
    );
    
    this.chain = [this.createGenesisBlock(data)];
  }

  private createGenesisBlock(data: Data): Block {
    return new Block(0, "0", data);
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  getAllBlocks(): Block[] {
    return this.chain;
  }

  addBlock(data: any): Block {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(previousBlock.index + 1, previousBlock.hash, data);
    this.chain.push(newBlock);
    return newBlock;
  }

  updateBlock(index: number, newData: any): string {
    if (index <= 0 || index >= this.chain.length) {
      return "❌ Invalid block index!";
    }

    console.log(`⚠️ Attempting to update Block ${index}...`);
    this.chain[index].data = newData; // Tampering attempt
    this.chain[index].hash = this.chain[index].calculateHash(); // Recalculate hash

    if (!this.validateChain()) {
      return `❌ Block ${index} has been tampered with!`;
    }

    return "✅ Blockchain is still valid!";
  }

  validateChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`❌ Block ${currentBlock.index} has been tampered with!`);
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log(`❌ Block ${currentBlock.index} has an invalid previous hash!`);
        return false;
      }
    }
    console.log("✅ Blockchain is valid!");
    return true;
  }
}

const blockchain = new Blockchain();

// 📌 Routes
app.get("/blocks", (req: Request, res: Response) => {
  res.json(blockchain.getAllBlocks());
});

app.post("/addBlock", (data: Data, res: any) => {
  // const { data } = req;
  if (!data) return res.status(400).json({ error: "Data is required" });

  const newBlock = blockchain.addBlock(data);
  res.json({ message: "✅ Block added!", block: newBlock });
});

app.put("/updateBlock", (updateData: modifyData, res: any) => {
  const index = updateData.index
  const data = updateData.data as Data; // Type assertion for TypeScript

  if (!data) {
    return res.status(400).json({ error: "New data is required" });
  }

  const result = blockchain.updateBlock(index, data);
  return res.json({ message: result });
});




app.get("/validate", (req: Request, res: Response) => {
  const isValid = blockchain.validateChain();
  res.json({ valid: isValid });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Blockchain API running on http://localhost:${PORT}`);
});
