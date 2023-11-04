import React, { useState } from 'react'
import { ProposalsItem } from './ProposalsItem'
import { CreateModal } from './CreateModal'

export const Proposals = () => {
  const [openCreateModal, setOpenCreateModal] = useState(false)
  return (
    <>
      <div className="w-full rounded-[12px] border-[1px] border-solid border-[#1a1a1a] bg-[#0d0d0d] px-[20px] py-[15px] sm:mr-0 md:w-[59%] md:px-[37px] lg:mr-2">
        <div className="flex items-center justify-between">
          <h4 className="font-larken text-[24px] font-[400] leading-[40px]">
            Proposals
          </h4>
          <button
            className="flex items-center gap-[5px]"
            onClick={() => setOpenCreateModal(true)}
          >
            <p className="text-[14px] font-[500] uppercase text-[#AA5BFF]">
              create
            </p>
            <img src="/assets/pages/vote/genover/next.svg" alt="" />
          </button>
        </div>
        <div className="gradient-border mt-2 hidden h-[1px] w-full md:block"></div>
        {/* {menu.map((item, i) => (
          <ProposalsItem menu={item} />
        ))} */}
        <div className="mx-auto w-full py-[58px]">
          <img
            src="/assets/pages/vote/genover/noproposal.png"
            alt=""
            className="mx-auto w-full max-w-[132px]"
          />
          <h3 className="font-larken mt-[35px] text-center text-[28px] font-[400] leading-[34px]">
            No proposals yet
          </h3>
          <p className="mx-auto mt-[6px] w-full text-center text-[18px] font-[500] text-[#959595] md:max-w-[320px] md:text-left">
            Stay tuned for the launch of TORQ, our deflationary governance
            token.
          </p>
        </div>
        {/* <div className="mt-[18px] cursor-pointer text-center text-[14px] font-[500] uppercase text-[#959595]">
          view all
        </div> */}
      </div>
      <CreateModal
        openModal={openCreateModal}
        handleCLose={() => setOpenCreateModal(false)}
      />
    </>
  )
}
const menu = [
  {
    title: 'Nunc neque ipsum, vulputate..',
    state: 'pending',
    tip: 'TIP-16',
    timeVote: 'Vote hasn’t started',
    voteRed: 0,
    voteGreen: 0,
  },
  {
    title: 'Increase rate of distributio..',
    state: 'active',
    tip: 'TIP-15',
    timeVote: '4 days, 12 hours left',
    voteRed: 0,
    voteGreen: 0,
  },
  {
    title: 'Lorid viverra conse tetus lo..',
    state: 'active',
    tip: 'TIP-14',
    timeVote: '1 day, 22 hours left',
    voteRed: 0,
    voteGreen: 0,
  },
  {
    title: 'Donec vel dui ut mi congse..',
    state: 'failed',
    tip: 'TIP-13',
    timeVote: 'Vote has ended',
    voteRed: 0,
    voteGreen: 0,
  },
  {
    title: 'Fusce ut enim tristiq lorp..',
    state: 'passed',
    tip: 'TIP-12',
    timeVote: 'Vote has ended',
    voteRed: 0,
    voteGreen: 0,
  },
]