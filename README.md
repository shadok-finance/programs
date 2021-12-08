# Shadok

Shadok is a minimalist protocol, built on Solana

## Installation

### Get Rust, Solana and Anchor

#### Install [node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

#### Install [rust](https://doc.rust-lang.org/book/ch01-01-installation.html)

#### Install [solana](https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool)

Check your Rust and Solana versions : 
```bash
rustup --version
rustc --version
cargo --version

solana --version
```

Install Anchor and mocha

```bash
cargo install --git https://github.com/project-serum/anchor anchor-cli --locked
npm install -g mocha 
```
If installation fails, try installing yarn before : 
```bash
npm install --global yarn
```
Finally : 
```bash
npm i
```

## Build and run locally
For local testing, set solana configuration to localhost :
```bash
solana config set --url localhost
```
Then build and run the test files : 
```bash
anchor build
anchor test
```

## Deploy and test on devnet
Switch solana config to devnet : 
```bash
solana config set --url devnet
```
Generate a Solana keypair and airdrop yourself some SOL, we will use them for devnet Deployment

```bash
solana-keygen new
solana airdrop 5 "YourPublicKeyHere"
```
Build the project and get your programId
```bash
anchor build
solana address -k target/deploy/shadok-keypair.json
```

Change the Anchor configuration to Devnet in ``Anchor.toml`` and set the programId to whatever was printed at the last step
```bash
[programs.localnet] to [programs.devnet]
cluster = "localnet" to cluster = "devnet"
shadok = "yourProgramIdHere"
wallet = "/Users/yourUserNameHere/.config/solana/id.json"
```

Update the programId in your program, ``lib.rs``
```bash
declare_id!("yourProgramIdHere");
```

Build again with the updated Anchor configuration
```bash
anchor build
```

Deploy and test. You should be able to see your transactions on https://solscan.io/ (devnet network)
```bash
anchor test
```

Test again without redeploying your program
```bash
anchor test --skip-deploy
```

## Contributing

Don't forget, `Time is money` and Shadoks pump endlessly.
