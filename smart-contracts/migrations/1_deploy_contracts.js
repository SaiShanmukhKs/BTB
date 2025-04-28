const TenderFactory = artifacts.require("TenderFactory");
const BiddingSystem = artifacts.require("BiddingSystem");

module.exports = async function (deployer) {
    await deployer.deploy(TenderFactory);
    const tenderFactoryInstance = await TenderFactory.deployed();
    await deployer.deploy(BiddingSystem, tenderFactoryInstance.address);
};