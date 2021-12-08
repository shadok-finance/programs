const anchor = require("@project-serum/anchor");
const {SystemProgram} = anchor.web3;
const assert = require("assert");
const {TOKEN_PROGRAM_ID} = require("@solana/spl-token");
const {getTokenAccount, createMint, createTokenAccount,} = require("./utils");


describe("Shadok management", () => {

    const provider = anchor.Provider.env();
    // Configure the client to use the local cluster.
    anchor.setProvider(provider);
    const program = anchor.workspace.Shadok;

    let mintAccount;
    let mintProgramAccountPubKey;
    let mintProgramAccountBump;
    let user;
    let user2;
    let gulpHole;

    before(async () => {
        [mintProgramAccountPubKey, mintProgramAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("mint_account")],
            program.programId
        );
    })

    beforeEach(async () => {

        user = anchor.web3.Keypair.generate();
        user2 = anchor.web3.Keypair.generate();

        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(user.publicKey, 1000000000),
            "confirmed"
        );

        await provider.connection.confirmTransaction(
            await provider.connection.requestAirdrop(user2.publicKey, 1000000000),
            "confirmed"
        );
    })

    it("initialize our program with Genesis Timestamp", async () => {


        await program.rpc.initialize(
            mintProgramAccountBump,
            {
                accounts: {
                    user: provider.wallet.publicKey,
                    minterStateAccount: mintProgramAccountPubKey,
                    systemProgram: SystemProgram.programId,
                },
            }
        );

        mintAccount = await createMint(provider);
        console.log("Mint account created")
        gulpHole = new anchor.web3.PublicKey('TheGu1p111111111111111111111111111111111111');

        //change mintAccount authority to program account
        await mintAccount.setAuthority(
            mintAccount.publicKey,
            mintProgramAccountPubKey,
            'MintTokens',
            provider.wallet.publicKey,
            [provider.wallet]
        )
        console.log("Mint account authority updated")

        const programAccount = await program.account.minterStateAccount.fetch(mintProgramAccountPubKey);
        const programGenesisTimestamp = programAccount.genesisTimestamp.toNumber().toString().slice(0, 8);
        const currentTimestamp = (+new Date()).toString().slice(0, 8);


        assert.equal(programGenesisTimestamp, currentTimestamp);



    })

    describe('manage gulp', function () {

        ///////////////////
        //test are running against a program with let seconds_in_a_week = 5;
        ///////////////////

        it("it transfer SOL to TheGulp11111111...", async () => {

            let userC999Account = await createTokenAccount(
                provider,
                mintAccount.publicKey,
                user.publicKey
            )


            const result = await program.rpc.gulp(new anchor.BN(1000000000), {
                accounts: {
                    from: user.publicKey,
                    gulpHole: gulpHole,
                    shadokProgramAccount: mintProgramAccountPubKey,
                    c999MintAccount: mintAccount.publicKey,
                    c999UserAccount: userC999Account,
                    c999ProgramId: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
                signers: [user]
            });

            let user_memecount_account = await getTokenAccount(
                provider,
                userC999Account
            )
            const userC999Balance = user_memecount_account.amount.toNumber();

            assert.equal(new anchor.BN(10000000000), userC999Balance);

            let gulpHoleBalance = await provider.connection.getBalance(gulpHole)
            assert.equal(new anchor.BN(1000000000), gulpHoleBalance);

        })

        it('should not overflow', async function (done) {
            // Some user
            this.timeout(0);

            let userC999Account = await createTokenAccount(
                provider,
                mintAccount.publicKey,
                user.publicKey
            )

            let userC999Account2 = await createTokenAccount(
                provider,
                mintAccount.publicKey,
                user2.publicKey
            )

            setTimeout(async function () {
                const result = await program.rpc.gulp(new anchor.BN(1000000000), {
                    accounts: {
                        from: user.publicKey,
                        gulpHole: gulpHole,
                        shadokProgramAccount: mintProgramAccountPubKey,
                        c999MintAccount: mintAccount.publicKey,
                        c999UserAccount: userC999Account,
                        c999ProgramId: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    },
                    signers: [user]
                });

                let user_memecount_account = await getTokenAccount(
                    provider,
                    userC999Account
                )

                const userC999Balance = user_memecount_account.amount.toNumber()

                console.log("user Bal after 60 sec :", userC999Balance)
                assert.equal(new anchor.BN(1220703), userC999Balance);

                let gulpHoleBalance = await provider.connection.getBalance(gulpHole)
                assert.equal(new anchor.BN(1000000000), gulpHoleBalance);

                setTimeout(async function () {
                    const result = await program.rpc.gulp(new anchor.BN(1000000000), {
                        accounts: {
                            from: user2.publicKey,
                            gulpHole: gulpHole,
                            shadokProgramAccount: mintProgramAccountPubKey,
                            c999MintAccount: mintAccount.publicKey,
                            c999UserAccount: userC999Account2,
                            c999ProgramId: TOKEN_PROGRAM_ID,
                            systemProgram: SystemProgram.programId,
                        },
                        signers: [user2]
                    });

                    let user_memecount_account = await getTokenAccount(
                        provider,
                        userC999Account2
                    )
                    const userC999Balance = user_memecount_account.amount.toNumber()
                    assert.equal(1, userC999Balance);
                    console.log("user Bal after 265+60 sec :", userC999Balance)

                    done();
                }, 265000);

            }, 60000);

        });
    });


});