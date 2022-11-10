// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {BaseExchangeModule} from "./BaseExchangeModule.sol";
import {BaseModule} from "../BaseModule.sol";
import {ISudoswapRouter} from "../../../interfaces/ISudoswapRouter.sol";

contract SudoswapModule is BaseExchangeModule {

    // --- Fields ---

    ISudoswapRouter public constant SUDOSWAP_ROUTER = 
        ISudoswapRouter(0x2B2e8cDA09bBA9660dCA5cB6233787738Ad68329);

    // --- Constructor ---

    constructor(address owner)
        BaseModule(owner)
        BaseExchangeModule(router) {
    }

    // --- Fallback ---

    receive() external payable {}

    // --- Single ETH listing ---

    function swapETHForSpecificNFTs(
        ISudoswapRouter.PairSwapSpecific[] calldata swapList,
        uint256 deadline,
        ETHListingParams calldata params,
        Fee[] calldata fees
    )
        external
        payable
        nonReentrant
        refundETHLeftover(params.refundTo)
        chargeETHFees(fees, params.amount)
    {
        // Execute fill
        _buy(swapList, params.refundTo, params.fillTo, deadline, params.revertIfIncomplete, params.amount);
    }

    // --- [ERC721] Single offer ---

    function acceptERC721Offer(
        ILooksRare.TakerOrder calldata takerAsk,
        ILooksRare.MakerOrder calldata makerBid,
        OfferParams calldata params
    ) external nonReentrant {
        IERC721 collection = IERC721(address(makerBid.collection));

        // Approve the transfer manager if needed
        _approveERC721IfNeeded(collection, ERC721_TRANSFER_MANAGER);

        // Execute the fill
        _sell(takerAsk, makerBid, params.fillTo, params.revertIfIncomplete);

        // Refund any ERC721 leftover
        _sendAllERC721(params.refundTo, collection, takerAsk.tokenId);
    }

    // --- ERC721 hook ---

    // Single token offer acceptance can be done approval-less by using the
    // standard `safeTransferFrom` method together with specifying data for
    // further contract calls. An example:
    // `safeTransferFrom(
    //      0xWALLET,
    //      0xMODULE,
    //      TOKEN_ID,
    //      0xABI_ENCODED_ROUTER_EXECUTION_CALLDATA_FOR_OFFER_ACCEPTANCE
    // )`

    function onERC721Received(
        address, // operator,
        address, // from
        uint256, // tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        if (data.length > 0) {
            _makeCall(router, data, 0);
        }

        return this.onERC721Received.selector;
    }

    // --- Internal ---

    function _buy(
        ISudoswapRouter.PairSwapSpecific[] calldata swapList,
        address ethRecipient,
        address nftRecipient,
        uint256 deadline,
        bool revertIfIncomplete,
        uint256 value
    ) 
        internal 
    {
        // Execute fill
        try SUDOSWAP_ROUTER.swapETHForSpecificNFTs{value: value}(swapList, payable(ethRecipient), nftRecipient, deadline) {
        } catch {
            if (revertIfIncomplete) {
                revert UnsuccessfulFill();
            }
        }
    }
}