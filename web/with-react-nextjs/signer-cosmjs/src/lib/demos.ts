export const DEMOS = [
  { href: "/message-signing", label: "Message signing", api: "signingClient.sign()" },
  { href: "/atom-transfer", label: "ATOM transfer", api: "signingClient.sendTokens()" },
  { href: "/ibc-transfer", label: "IBC transfer", api: "MsgTransfer" },
  { href: "/staking", label: "Staking", api: "MsgDelegate" },
  { href: "/governance", label: "Governance", api: "MsgVote" },
  { href: "/cosmwasm-interaction", label: "CosmWasm", api: "signingClient.execute()" },
];
