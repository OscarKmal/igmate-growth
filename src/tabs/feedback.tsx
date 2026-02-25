import { useState } from 'react';
import "~styles/index.css";
import browser from 'webextension-polyfill';
import { Button } from '~components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~components/ui/card';
import { Textarea } from '~components/ui/textarea';
import { Label } from '~components/ui/label';
import { Input } from '~components/ui/input';
import { ArrowLeft, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Fetcher } from '~utils/Fetcher';

const onBack = async()=>{
	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
	if (tabs[0]) {
	    const currentTabId = tabs[0].id;
	    await browser.tabs.remove(currentTabId);
	}
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const rtndata = await Fetcher.saveFeedback(email, feedback);
    setIsSubmitting(false);
    if(rtndata.code == 200){
      setIsSubmitted(true);
      toast.success(browser.i18n.getMessage('feedback_toast_success'));

      setTimeout(()=>{
        setFeedback('');
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    }else{
      toast.error(browser.i18n.getMessage('feedback_toast_fail'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-center" richColors />
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {browser.i18n.getMessage('feedback_return')}
        </Button>

        {/* Feedback Form Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>{browser.i18n.getMessage('feedback_title')}</CardTitle>
                <CardDescription className="mt-1">
                  {browser.i18n.getMessage('feedback_description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl mb-2">{browser.i18n.getMessage('feedback_success')}</h3>
                  <p className="text-sm text-gray-500">
                    {browser.i18n.getMessage('feedback_success_tip')}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                  {browser.i18n.getMessage('feedback_email')} <span className="text-gray-400">{browser.i18n.getMessage('feedback_option')}</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                  {browser.i18n.getMessage('feedback_email_placeholder')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">
                    {browser.i18n.getMessage('feedback_content')} <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="feedback"
                    placeholder={browser.i18n.getMessage('feedback_content_placeholder')}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[200px] resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {feedback.length} / 1000 {browser.i18n.getMessage('feedback_char')}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={isSubmitting || !feedback.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {browser.i18n.getMessage('feedback_submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {browser.i18n.getMessage('feedback_submit')}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onBack}
                  >
                    {browser.i18n.getMessage('feedback_cancle')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-900">{browser.i18n.getMessage('feedback_tip')}</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{browser.i18n.getMessage('feedback_tip1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{browser.i18n.getMessage('feedback_tip2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{browser.i18n.getMessage('feedback_tip3')}</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
