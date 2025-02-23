import { useOneCsProgram } from "../heritage/one_cs-data-access";
import { TextCard, TokenCard } from "../shared/one_cs-cards";

export function OneCsList() {
  const { accounts } = useOneCsProgram();

  if (accounts.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Encapsulated Data</h2>
      {accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data.map((account) =>
            account.account.data.text ? (
              <TextCard
                key={account.publicKey.toString()}
                data={account.account}
              />
            ) : (
              <TokenCard
                key={account.publicKey.toString()}
                data={account.account}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl">No Encapsulated Data</h2>
          <p>Create new encapsulations to get started.</p>
        </div>
      )}
    </div>
  );
}
