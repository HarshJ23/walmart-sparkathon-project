import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Settings2 } from 'lucide-react';
import Recipe from "./Recipe";
import Tryon from "./Tryon";


interface ToolCategory{
    toolcat : string;
}

const Tool : React.FC<ToolCategory> = ({toolcat}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-xl" size="icon"><Settings2 size={20} strokeWidth={2}  color="#3b82f6" /></Button>
      </SheetTrigger>
      <SheetContent className="w-[1000px]">
        <SheetHeader>
          <SheetTitle><span className="text-primary font-bold text-2xl">Mr.Sam</span> Tools</SheetTitle>
          <SheetDescription>
         Mr.Sam AI-recommended tools for a seamless shopping journey.
         </SheetDescription>
        </SheetHeader>
        {/* specific tools components div */}
        <div className="py-4">
            {toolcat == "Grocery" ?  <Recipe/> : <Tryon/>}
        {/* <Recipe/> */}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default Tool;