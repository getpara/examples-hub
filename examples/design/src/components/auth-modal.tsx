import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import ParaInput from './custom/para-input';
import { Button } from './ui/button';
import OrDivider from './custom/or-divider';
import Apple from './ui/icons/apple';
import Facebook from './ui/icons/facebook';
import Google from './ui/icons/google';
import Phantom from './ui/icons/phantom';
import Rainbow from './ui/icons/rainbow';
import Metamask from './ui/icons/metamask';
import ParaWordmark from './ui/icons/para-wordmark';
import Link from 'next/link';

export default function AuthModal() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Sign Up or Login</Button>
        </DialogTrigger>

        <DialogContent
          className="para:w-[400px] para:data-[state=open]:animate-none para:data-[state=closed]:animate-none para:flex para:flex-col para:gap-4"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogHeader className="para:flex para:flex-col para:items-center para:justify-center">
            <div className="para:my-4">
              <svg
                className="para:max-h-16"
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_215_16617)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 32C20.3398 32 32 20.3398 32 0C32 20.3398 43.6602 32 64 32C43.6602 32 32 43.6602 32 64C32 43.6602 20.3398 32 0 32Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_215_16617">
                    <rect width="64" height="64" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            <DialogTitle className="para:text-base">Sign Up or Login</DialogTitle>
          </DialogHeader>
          <div className="para:flex para:flex-col para:gap-4">
            <ParaInput placeholder="Email or Phone Number" className="para:!rounded-none" />
            <OrDivider />
            <div className="para:flex para:flex-col para:gap-1">
              <div className="para:flex para:flex-row para:gap-1 para:w-full">
                <Button
                  variant="secondary"
                  className="para:h-[44px] para:flex-1 para:cursor-pointer para:hover:scale-102 para:transition-all para:duration-200"
                >
                  <Google />
                </Button>
                <Button
                  variant="secondary"
                  className="para:h-[44px] para:flex-1 para:cursor-pointer para:hover:scale-102 para:transition-all para:duration-200"
                >
                  <Apple />
                </Button>
                <Button
                  variant="secondary"
                  className="para:h-[44px] para:flex-1 para:cursor-pointer para:hover:scale-102 para:transition-all para:duration-200"
                >
                  <Facebook />
                </Button>
              </div>

              <Button
                variant="secondary"
                className="para:h-[44px] para:w-full para:cursor-pointer para:hover:scale-101 para:transition-all para:duration-200"
              >
                More Socials
              </Button>
            </div>
            <OrDivider />
            <div className="para:flex para:flex-col para:gap-1">
              <div className="para:flex para:flex-row para:gap-1 para:w-full">
                <Button
                  variant="secondary"
                  className="para:h-[44px] para:flex-1 para:text-xs para:cursor-pointer para:hover:scale-102 para:transition-all para:duration-200"
                >
                  <Phantom /> Phantom
                </Button>
                <Button
                  variant="secondary"
                  className="para:h-[44px] para:flex-1 para:text-xs para:cursor-pointer para:hover:scale-102 para:transition-all para:duration-200"
                >
                  <Rainbow /> Rainbow
                </Button>
                <Button
                  variant="secondary"
                  className="para:h-[44px] para:flex-1 para:text-xs para:cursor-pointer para:hover:scale-102 para:transition-all para:duration-200"
                >
                  <Metamask /> Metamask
                </Button>
              </div>

              <Button
                variant="secondary"
                className="para:h-[44px] para:w-full para:cursor-pointer para:hover:scale-101 para:transition-all para:duration-200"
              >
                More Wallets
              </Button>
            </div>
            <OrDivider />
            <div className="para:flex para:flex-row para:justify-center">
              <Link
                href="/"
                className="para:text-xs para:text-muted-foreground para:hover:text-primary para:transition-all para:duration-300"
              >
                Continue as Guest
              </Link>
            </div>
          </div>
          <DialogFooter className="para:!flex para:!flex-col para:!justify-center para:items-center para:text-center ">
            <p className="para:text-xs para:text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link href="/" className="para:text-primary">
                Terms & Conditions
              </Link>
            </p>
            <ParaWordmark />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
