'use client'

import { getOneCsProgram, getOneCsProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useOneCsProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getOneCsProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getOneCsProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['one_cs', 'all', { cluster }],
    queryFn: () => program.account.one_cs.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['one_cs', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ one_cs: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useOneCsProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useOneCsProgram()

  const accountQuery = useQuery({
    queryKey: ['one_cs', 'fetch', { cluster, account }],
    queryFn: () => program.account.one_cs.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['one_cs', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ one_cs: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['one_cs', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ one_cs: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['one_cs', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ one_cs: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['one_cs', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ one_cs: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
