import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Post as PostType } from "@/types/api";
import Post from "./Post";

interface PostModalProps {
  post: PostType | null;
  isOpen: boolean;
  onClose: () => void;
}

const PostModal = ({ post, isOpen, onClose }: PostModalProps) => {
  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-background border-none">
        <Post post={post} expandComments={true} />
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;