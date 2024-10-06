type BlogItemProps = {
  id?: string | number;
  title?: string;
  slug?: string;
  content?: string;
  featureImage?: string | File;
  state?: string;
  tags?: string[];
  userId?: string | number;
};
