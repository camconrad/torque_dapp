import { toMetricUnits } from '@/lib/helpers/number'
import { NumericFormat } from 'react-number-format'
import { useSelector } from 'react-redux'
import { AppStore } from '@/types/store'
import Link from 'next/link'

export const ProposalsItem = (props: any) => {
  const { menu } = props
  console.log(menu)

  const theme = useSelector((store: AppStore) => store.theme.theme)

  let classnamesState =
    'rounded-[6px] bg-[#ff9c4155] px-[12px] py-[1px] text-[12px] font-[500] uppercase text-[#1EB26B]'
  if (menu.stage === 'Active') {
    classnamesState =
      'rounded-[6px] bg-[#1eb26b55] px-[12px] py-[1px] text-[12px] font-[500] uppercase text-[#1EB26B]'
  } else if (menu.stage === 'Pending') {
    classnamesState =
      'rounded-[6px] bg-[#ff9c4155] px-[12px] py-[1px] text-[12px] font-[500] uppercase text-[#FF9C41]'
  } else if (menu.stage === 'Failed') {
    classnamesState =
      'rounded-[6px] bg-[#ff3e3e55] px-[12px] py-[1px] text-[12px] font-[500] uppercase text-[#F05858]'
  } else if (menu.stage === 'Passed') {
    classnamesState =
      'rounded-[6px] bg-[#aa5bff55] px-[12px] py-[1px] text-[12px] font-[500] uppercase text-[#C38BFF]'
  }

  return (
    <Link href={`/vote/${menu?.id}`}>
      <div className="mt-[10px] cursor-pointer transition-all duration-100 ease-linear hover:opacity-70">
        <div className="items-center justify-between md:flex">
          <div className="sm:mt-[0px] md:mt-0 md:w-[60%]">
            <h4 className="font-larken text-[20px] truncate ... font-[400] leading-[40px] text-[#030303] dark:text-white">
              {menu.title}
            </h4>
            <div className="flex items-center gap-[8px]">
              <div className={classnamesState}>
                {menu.stage}
              </div>
              <p className="text-[14px] font-[500] text-[#959595] md:text-[16px]">
                TIP-{menu.id}
              </p>
              <div className="h-[5px] w-[5px] rounded-full bg-[#959595]"></div>
              <p className="text-[14px] font-[500] text-[#959595] md:text-[16px]">
                {menu.timeVote}
              </p>
            </div>
          </div>

          <div className="mt-[10px] md:w-[40%]">
            <div className="flex w-full items-center justify-start gap-[8px] md:justify-end">
              <p className="text-[14px] font-[500] text-[#F05858]">
                {toMetricUnits(menu.voteRed, 2).toLocaleLowerCase()}
              </p>
              <div className="relative h-[4px] w-full max-w-[160px] rounded-[12px]">
                {menu.voteGreen === 0 && menu.voteRed === 0 ? (
                  <>
                    <div className="absolute left-0 h-[4px] w-[50%] rounded-[12px] rounded-br-none rounded-tr-none bg-[#F05858]"></div>
                    <div className="absolute right-0 h-[4px] w-[50%] rounded-[12px] rounded-bl-none rounded-tl-none bg-[#1EB26B]"></div>
                  </>
                ) : (
                  <>
                    <div
                      className="absolute left-0 h-[4px] rounded-[12px] bg-[#F05858]"
                      style={{
                        width:
                          Math.round(
                            (menu.voteRed / (menu.voteGreen + menu.voteRed)) *
                              100
                          ) + '%',
                      }}
                    ></div>
                    <div
                      className="absolute right-0 h-[4px] rounded-[12px] bg-[#1EB26B]"
                      style={{
                        width:
                          Math.round(
                            (menu.voteGreen / (menu.voteGreen + menu.voteRed)) *
                              100
                          ) + '%',
                      }}
                    ></div>
                  </>
                )}
              </div>
              <p className="text-[14px] font-[500] text-[#1EB26B]">
                {toMetricUnits(menu?.voteGreen).toLocaleLowerCase()}
              </p>
            </div>
            <p className="text-left font-[500] leading-[24px] text-[#959595] md:text-right">
              <NumericFormat
                displayType="text"
                value={menu.voteGreen + menu.voteRed}
                thousandSeparator
                suffix=".00 total votes"
              />
            </p>
          </div>
        </div>
        <div
          className={
            `mt-3 h-[1px] w-full md:block` +
            `
      ${
        theme === 'light' ? 'bg-gradient-divider-light' : 'bg-gradient-divider'
      }`
          }
        ></div>
      </div>
    </Link>
  )
}
