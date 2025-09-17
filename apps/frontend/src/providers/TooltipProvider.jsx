// Inside Sidebar.jsx, inside the map loop:
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Wrap the Button like this:
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button ... >...</Button>
    </TooltipTrigger>
    <TooltipContent side="right" className="bg-card text-card-foreground">
      {item.label}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>