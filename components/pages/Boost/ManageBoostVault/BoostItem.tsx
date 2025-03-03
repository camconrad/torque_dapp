import CurrencySwitch from '@/components/common/CurrencySwitch'
import LoadingCircle from '@/components/common/Loading/LoadingCircle'
import { useTokensDataRequest } from '@/domain/synthetics/tokens'
import { LabelApi } from '@/lib/api/LabelApi'
import { bigNumberify } from '@/lib/numbers'
import { AppStore } from '@/types/store'
import { useWeb3Modal } from '@web3modal/react'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AutowidthInput } from 'react-autowidth-input'
import { AiOutlineCheck, AiOutlineEdit } from 'react-icons/ai'
import { NumericFormat } from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useAccount, useChainId } from 'wagmi'
import { arbitrum } from 'wagmi/dist/chains'
import Web3 from 'web3'
import {
  estimateExecuteWithdrawalGasLimit,
  getExecutionFee,
} from '../hooks/getExecutionFee'
import { useGasLimits } from '../hooks/useGasLimits'
import { useGasPrice } from '../hooks/useGasPrice'
import { IBoostInfo } from '../types'
import { BoostItemChart } from './BoostItemChart'
import ConnectWalletModal from '@/layouts/MainLayout/ConnectWalletModal'
import { AppState } from '@/lib/redux/store'
import {
  updateCreatedLink,
  updateCreatedUni,
  updateCreatedWbtc,
  updateCreatedWeth,
  updateCreatedComp,
  updateCreatedTorq,
} from '@/lib/redux/slices/boost'
import { cn } from '@/lib/helpers/utils'

interface BoostItemProps {
  item: IBoostInfo
  onWithdrawSuccess?: VoidFunction
  setIsFetchBoostLoading?: any
  className?: string
}

export function BoostItem({
  item,
  onWithdrawSuccess,
  setIsFetchBoostLoading,
  className,
}: BoostItemProps) {
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  const dispatch = useDispatch()
  const { address, isConnected } = useAccount()
  const theme = useSelector((store: AppStore) => store.theme.theme)
  const usdPrice = useSelector((store: AppStore) => store.usdPrice?.price)

  const refLabelInput = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [isEdit, setEdit] = useState(false)
  const [isSubmitLoading, setSubmitLoading] = useState(false)
  const [label, setLabel] = useState(item?.defaultLabel)
  const [apr, setApr] = useState('')
  const [earnings, setEarnings] = useState('')
  const [deposited, setDeposited] = useState('')
  const [isExecuteLoading, setIsExecuteLoading] = useState(false)
  const { tokensData, pricesUpdatedAt } = useTokensDataRequest(chainId)
  const [isOpenConnectWalletModal, setOpenConnectWalletModal] = useState(false)
  const { gasPrice } = useGasPrice(chainId)
  const {
    createdWbtc,
    createdWeth,
    createdLink,
    createdUni,
    createdComp,
    createdTorq,
  } = useSelector((state: AppState) => state.boost)

  const tokenContract = useMemo(() => {
    const web3 = new Web3(Web3.givenProvider)
    const contract = new web3.eth.Contract(
      JSON.parse(item?.tokenContractInfo?.abi),
      item?.tokenContractInfo?.address
    )
    return contract
  }, [Web3.givenProvider, item?.tokenSymbol])

  const gmxContract = useMemo(() => {
    const web3 = new Web3(Web3.givenProvider)
    if (!item?.gmxContractInfo?.abi) {
      console.error('Token contract ABI is undefined')
      return null
    }
    return new web3.eth.Contract(
      JSON.parse(item.gmxContractInfo.abi),
      item.gmxContractInfo.address
    )
  }, [Web3.givenProvider, item.gmxContractInfo])

  const boostContract = useMemo(() => {
    const web3 = new Web3(Web3.givenProvider)
    const contract = new web3.eth.Contract(
      JSON.parse(item?.boostContractInfo?.abi),
      item?.boostContractInfo?.address
    )
    return contract
  }, [Web3.givenProvider, item?.tokenSymbol])

  const { gasLimits } = useGasLimits(arbitrum.id)

  const handleGetBoostData = async () => {
    if (!boostContract || !address || !tokenContract) {
      return
    }

    try {
      const tokenDecimal = await tokenContract.methods.decimals().call()
      const deposited = await boostContract.methods.balanceOf(address).call()
      setDeposited(
        new BigNumber(
          ethers.utils.formatUnits(deposited, tokenDecimal)
        ).toString()
      )
    } catch (error) {
      console.log('error get boost data item :>> ', error)
    }
  }

  useEffect(() => {
    handleGetBoostData()
  }, [boostContract, address, tokenContract])

  const onWithdraw = async () => {
    if (!isConnected || !address) {
      // await open()
      setOpenConnectWalletModal(true)
      return
    }
    setIsExecuteLoading(true)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner(address)
      const gmxContract2 = new ethers.Contract(
        item?.gmxContractInfo?.address,
        JSON.parse(item?.gmxContractInfo?.abi),
        signer
      )
      const slippage = 20
      const tx = await gmxContract2.withdrawAmount(slippage)
      // await gmxContract.methods.withdrawAmount(slippage).send({ from: address })
      await tx.wait()
      toast.success('Execute Successful')
      setIsFetchBoostLoading && setIsFetchBoostLoading((prev: any) => !prev)
      handleGetBoostData()
    } catch (error) {
      console.log('error111 :>> ', error)
      toast.error('Execute Failed')
    } finally {
      setIsExecuteLoading(false)
    }
  }

  const onCreate = async () => {
    if (!isConnected || !address) {
      // await open()
      setOpenConnectWalletModal(true)
      return
    }
    try {
      setSubmitLoading(true)
      const decimalToken = await tokenContract.methods.decimals().call()
      const withdrawAmount = ethers.utils
        .parseUnits(Number(amount).toFixed(decimalToken), decimalToken)
        .toString()

      const allowanceToken = await tokenContract.methods
        .allowance(address, item?.boostContractInfo?.address)
        .call()
      if (
        new BigNumber(allowanceToken).lte(new BigNumber('0')) ||
        new BigNumber(allowanceToken).lte(withdrawAmount)
      ) {
        // await tokenContract.methods
        //   .approve(
        //     item?.boostContractInfo?.address,
        //     '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        //   )
        //   .send({ from: address })
      }
      const estimateExecuteWithdrawalGasLimitValue =
        estimateExecuteWithdrawalGasLimit(gasLimits, {})

      console.log(
        'estimateExecuteWithdrawalGasLimit',
        estimateExecuteWithdrawalGasLimitValue?.toString()
      )

      const executionFee = getExecutionFee(
        chainId,
        gasLimits,
        tokensData,
        estimateExecuteWithdrawalGasLimitValue,
        gasPrice
      )

      const executionFeeAmount = bigNumberify(
        executionFee?.feeTokenAmount
      ).toString()

      console.log('executionFeeAmount', executionFeeAmount, executionFee)

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner(address)
      const boostContract2 = new ethers.Contract(
        item?.boostContractInfo?.address,
        JSON.parse(item?.boostContractInfo?.abi),
        signer
      )
      if (item.tokenSymbol === 'WETH') {
        const tx = await boostContract2.withdrawETH(withdrawAmount, {
          value: executionFeeAmount,
        })
        await tx.wait()
      }
      if (item.tokenSymbol === 'WBTC') {
        const tx = await boostContract2.withdrawBTC(withdrawAmount, {
          value: executionFeeAmount,
        })
        await tx.wait()
      }
      if (item.tokenSymbol === 'LINK') {
        const tx = await boostContract2.withdrawLINK(withdrawAmount, {
          value: executionFeeAmount,
        })
        await tx.wait()
      }
      if (item.tokenSymbol === 'UNI') {
        const tx = await boostContract2.withdrawUNI(withdrawAmount, {
          value: executionFeeAmount,
        })
        await tx.wait()
      }
      if (item.tokenSymbol === 'COMP') {
        const tx = await boostContract2.withdrawUNI(withdrawAmount, {
          value: executionFeeAmount,
        })
        await tx.wait()
      }
      if (item.tokenSymbol === 'TORQ') {
        const tx = await boostContract2.withdrawUNI(withdrawAmount, {
          value: executionFeeAmount,
        })
        await tx.wait()
      }
      setAmount('')
      toast.success('Withdrawal Success')
      onWithdrawSuccess && onWithdrawSuccess()
      handleGetBoostData()
      if (item.tokenSymbol === 'WBTC') {
        dispatch(updateCreatedWbtc(true as any))
      }
      if (item.tokenSymbol === 'WETH') {
        dispatch(updateCreatedWeth(true as any))
      }
      if (item.tokenSymbol === 'LINK') {
        dispatch(updateCreatedLink(true as any))
      }
      if (item.tokenSymbol === 'UNI') {
        dispatch(updateCreatedUni(true as any))
      }
      if (item.tokenSymbol === 'COMP') {
        dispatch(updateCreatedLink(true as any))
      }
      if (item.tokenSymbol === 'TORQ') {
        dispatch(updateCreatedUni(true as any))
      }
    } catch (e) {
      toast.error('Withdraw Failed')
      console.log(e)
    } finally {
      setSubmitLoading(false)
    }
  }

  const updateBoostLabel = async () => {
    setEdit(false)
    try {
      await LabelApi.updateLabel({
        walletAddress: address,
        tokenSymbol: item?.tokenSymbol,
        position: 'Boost',
        name: label,
      })
      toast.success('Update name successful')
    } catch (error) {
      toast.error('Update name failed')
      console.error('updateBoostLabel', error)
    }
  }

  useEffect(() => {
    if (isEdit && refLabelInput.current) {
      refLabelInput.current.focus()
    }
  }, [isEdit])

  useEffect(() => {
    setLabel(item?.label)
  }, [item?.label])

  const summaryInfo = () => {
    return (
      <div className="flex w-full items-center justify-between">
        <CurrencySwitch
          tokenSymbol={item?.tokenSymbol}
          tokenValue={Number(deposited)}
          usdDefault
          className="-my-4 flex h-full min-w-[130px] flex-col items-center justify-center gap-2 py-4"
          render={(value) => (
            <div className="flex min-w-[130px] flex-col items-center justify-center gap-2">
              <p className="text-[22px]">{value}</p>
              <div className="font-rogan-regular text-[14px] text-[#959595]">
                Deposited
              </div>
            </div>
          )}
          decimalScale={5}
        />
        <CurrencySwitch
          tokenSymbol={item?.tokenSymbol}
          tokenValue={Number(
            new BigNumber(deposited).multipliedBy(item.APR / 100).toString()
          )}
          usdDefault
          className="-my-4 flex h-full min-w-[130px] flex-col items-center justify-center gap-2 py-4"
          decimalScale={5}
          render={(value) => (
            <div className="flex min-w-[130px] flex-col items-center justify-center gap-2">
              <p className="text-[22px]">{value}</p>
              <div className="font-rogan-regular text-[14px] text-[#959595]">
                Earnings
              </div>
            </div>
          )}
        />
        <div className="mt-[5px] flex min-w-[130px] flex-col items-center justify-center gap-2">
          <div className="text-[22px]">
            <NumericFormat
              displayType="text"
              value={item?.APR}
              suffix="%"
              decimalScale={2}
            />
          </div>

          <div className="font-rogan-regular mt-[-4px] text-[14px] text-[#959595]">
            Variable APR
          </div>
        </div>
      </div>
    )
  }

  const renderSubmitText = () => {
    if (!address) {
      return 'Connect Wallet'
    }
    return 'Create'
  }

  const isUnFirstCreated =
    (item.tokenSymbol === 'WBTC' && !createdWbtc) ||
    (item.tokenSymbol === 'WETH' && !createdWeth) ||
    (item.tokenSymbol === 'LINK' && !createdLink) ||
    (item.tokenSymbol === 'UNI' && !createdUni) ||
    (item.tokenSymbol === 'COMP' && !createdComp) ||
    (item.tokenSymbol === 'TORQ' && !createdTorq)

  return (
    <>
      <div
        className={cn(
          'dark-text-[#000] mt-[24px] grid rounded-[12px] border border-[#E6E6E6] bg-[#FFFFFF] from-[#0d0d0d] to-[#0d0d0d]/0 px-[24px] py-[20px] text-[#464646] dark:border-[#1A1A1A] dark:bg-transparent dark:bg-gradient-to-br dark:text-white',
          className
        )}
      >
        <div className="grid w-full grid-cols-2">
          <div className="font-rogan flex w-[calc(100%-64px)] items-center space-x-2 text-[22px] md:w-[calc(100%-400px-64px)] lg:w-[calc(100%-500px-64px)] xl:w-[calc(100%-600px-64px)]">
            <div className="flex items-center text-[22px]">
              <img
                className="mr-1 w-[54px]"
                src={`/icons/coin/${item.tokenSymbol.toLowerCase()}.png`}
                alt=""
              />
              {!isEdit ? (
                <>
                  <div className="mr-1 flex-shrink-0">{label}</div>
                  <div className="relative flex items-center">
                    <button
                      className="absolute ml-[4px]"
                      onClick={() => setEdit(true)}
                    >
                      <AiOutlineEdit />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <AutowidthInput
                    ref={refLabelInput}
                    className="bg-transparent"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && updateBoostLabel()}
                  />
                  <div className="relative flex items-center">
                    <button
                      className="absolute ml-[4px]"
                      onClick={() => updateBoostLabel()}
                    >
                      <AiOutlineCheck />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-14">
            <div className="hidden items-center justify-between gap-14 lg:flex">
              {summaryInfo()}
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <button className="" onClick={() => setOpen(!isOpen)}>
                <img
                  className={
                    'w-[18px] text-[#000] transition-all' +
                    ` ${isOpen ? 'rotate-180' : ''}`
                  }
                  src={
                    theme == 'light'
                      ? '/icons/dropdow-dark.png'
                      : '/icons/arrow-down.svg'
                  }
                  alt=""
                />
              </button>
            </div>
          </div>
        </div>
        <div
          className={`grid grid-cols-1 gap-8 overflow-hidden transition-all duration-300 lg:grid-cols-2 ${
            isOpen
              ? 'max-h-[1000px] py-[16px] ease-in'
              : 'max-h-0 py-0 opacity-0 ease-out'
          }`}
        >
          <div className="flex items-center justify-between gap-4 lg:hidden">
            {summaryInfo()}
          </div>
          <div className="">
            <BoostItemChart
              label="Boost APR"
              item={item}
              contractAddress={item?.boostContractInfo.address}
              tokenDecimals={item?.tokenDecimals}
              tokenPrice={
                item?.tokenSymbol === 'WBTC'
                  ? usdPrice['wbtc']
                  : usdPrice['weth']
              }
              aprPercent={item?.APR}
            />
          </div>
          <div className="mt-8">
            <div className="text-[28px]">Withdraw {item?.tokenSymbol}</div>
            <div className="mt-4 flex w-full items-center justify-between rounded-[12px] border bg-[#FFFFFF] px-2 py-4 dark:border-[#1A1A1A] dark:bg-[#161616]">
              <NumericFormat
                className="font-rogan-regular w-full bg-transparent bg-none px-2 focus:outline-none"
                placeholder="Select amount"
                value={amount || null}
                onChange={(e) => setAmount(e.target.value)}
                decimalScale={item.tokenSymbol === 'WBTC' ? 8 : 18}
              />

              <div className="flex items-center gap-2">
                {[25, 50, 100].map((percent: any, i) => (
                  <button
                    key={i}
                    className="font-rogan-regular rounded bg-[#F4F4F4] px-2 py-1 text-sm text-[#959595] dark:bg-[#1A1A1A]"
                    onClick={() => {
                      console.log(
                        'object :>> ',
                        new BigNumber(percent)
                          .multipliedBy(new BigNumber(deposited || 0))
                          .dividedBy(100)
                          .toString()
                      )
                      setAmount(
                        new BigNumber(percent)
                          .multipliedBy(new BigNumber(deposited || 0))
                          .dividedBy(100)
                          .toString()
                      )
                    }}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
            <button
              className={
                `font-rogan-regular mt-2 w-full rounded-full border border-[#AA5BFF] bg-gradient-to-b from-[#AA5BFF] to-[#912BFF] py-1 text-[14px] uppercase text-white transition-all hover:border hover:border-[#AA5BFF] hover:from-transparent hover:to-transparent hover:text-[#AA5BFF]` +
                ` ${
                  isSubmitLoading || isExecuteLoading
                    ? 'cursor-not-allowed opacity-70'
                    : ''
                }`
              }
              disabled={isSubmitLoading || isExecuteLoading}
              onClick={() => onCreate()}
            >
              {isSubmitLoading && <LoadingCircle />}
              {renderSubmitText()}
            </button>
            <button
              className={
                `font-rogan-regular mt-3 w-full rounded-full border border-[#AA5BFF] bg-gradient-to-b from-transparent to-transparent py-1 text-[14px] uppercase text-[#AA5BFF] transition-all hover:border hover:from-[#AA5BFF] hover:to-[#912BFF] hover:text-white` +
                ` ${
                  isUnFirstCreated || isSubmitLoading || isExecuteLoading
                    ? 'cursor-not-allowed opacity-70'
                    : ''
                }`
              }
              // disabled={isUnFirstCreated || isSubmitLoading || isExecuteLoading}
              onClick={() => onWithdraw()}
            >
              {isExecuteLoading && <LoadingCircle />}
              Execute
            </button>
          </div>
        </div>
      </div>

      <ConnectWalletModal
        openModal={isOpenConnectWalletModal}
        handleClose={() => setOpenConnectWalletModal(false)}
      />
    </>
  )
}
