import { useTranslation } from "react-i18next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDescription({ description }) {
    const { t } = useTranslation("product");

    if (!description) return null;

    const isHtml = /<[a-z][\s\S]*>/i.test(description);

    return (
        <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description" className="border-border">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                    {t("detail.description")}
                </AccordionTrigger>
                <AccordionContent>
                    {isHtml ? (
                        <div
                            className="prose prose-sm max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {description}
                        </p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
